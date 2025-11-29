#!/usr/bin/env python3
"""
Chess Opening Clustering Analysis using K-Means

This script performs K-means clustering on chess openings based on their win/loss/draw patterns.
Uses PCA for dimensionality reduction and generates meaningful cluster labels.

Outputs: 
- data/generated_data/opening_clusters.json
- data/generated_data/opening_cluster_visualization.png
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
import matplotlib.pyplot as plt
import json
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from logging_config import setup_logging, log_file_operation, log_data_processing, log_error_with_context


def load_win_rates_data(logger):
    """
    Load win rates data from the generated visualization files.
    
    Args:
        logger: Logger instance for output
    
    Returns:
        DataFrame with opening win rates data
    """
    possible_paths = [
        "backend/data/generated_data/opening_win_rates_complete.json",
        "data/generated_data/opening_win_rates_complete.json"
    ]
    
    for path in possible_paths:
        try:
            df = pd.read_json(path)
            log_file_operation(logger, "Loaded data from", path)
            return df
        except FileNotFoundError:
            continue
        except Exception as e:
            log_error_with_context(logger, e, f"loading {path}")
            continue
    
    logger.error("Could not find win rates data file")
    logger.error("Please run 04_visualization_data.py first")
    return None


def clean_and_prepare_data(df, logger):
    """
    Clean and prepare the data for clustering with enhanced features.
    
    Args:
        df: DataFrame with win rates data
        logger: Logger instance for output
        
    Returns:
        Cleaned DataFrame ready for clustering with additional features
    """
    # Drop rows with missing or invalid data
    df_clean = df.dropna(subset=["white", "black", "draw"]).copy()
    
    # Ensure percentages are valid (0-100)
    df_clean = df_clean[
        (df_clean["white"] >= 0) & (df_clean["white"] <= 100) &
        (df_clean["black"] >= 0) & (df_clean["black"] <= 100) &
        (df_clean["draw"] >= 0) & (df_clean["draw"] <= 100)
    ]
    
    # Dynamic threshold based on data distribution
    total_games_threshold = max(10, df_clean["total"].quantile(0.1))
    df_clean = df_clean[df_clean["total"] >= total_games_threshold]
    
    # Ensure percentages roughly sum to 100 (allow some tolerance for rounding)
    df_clean["percentage_sum"] = df_clean["white"] + df_clean["black"] + df_clean["draw"]
    df_clean = df_clean[
        (df_clean["percentage_sum"] >= 95) & (df_clean["percentage_sum"] <= 105)
    ]
    
    # Add derived features for better clustering
    df_clean["white_advantage"] = df_clean["white"] - df_clean["black"]
    df_clean["decisiveness"] = df_clean["white"] + df_clean["black"]  # 100 - draw rate
    df_clean["total_log"] = np.log1p(df_clean["total"])  # Log-scaled game count
    df_clean["white_black_ratio"] = df_clean["white"] / (df_clean["black"] + 0.1)  # Avoid division by zero
    
    # Categorize by game volume for weighted analysis
    df_clean["volume_category"] = pd.cut(
        df_clean["total"], 
        bins=[0, 50, 200, 1000, float('inf')], 
        labels=['Low', 'Medium', 'High', 'Very High']
    )
    
    log_data_processing(logger, "Data cleaned openings remaining", len(df_clean), len(df))
    logger.info(f"Game count threshold applied: {total_games_threshold:.0f}")
    return df_clean.drop("percentage_sum", axis=1)


def determine_optimal_clusters(features, max_k=12, logger=None):
    """
    Determine optimal number of clusters using multiple methods.
    
    Args:
        features: Scaled feature matrix
        max_k: Maximum number of clusters to test
        logger: Logger instance for output
        
    Returns:
        Optimal number of clusters and metrics
    """
    if logger is None:
        logger = setup_logging(level="INFO", module_name="clustering")
    k_range = range(2, min(max_k + 1, len(features) // 3))
    inertias = []
    silhouette_scores = []
    calinski_scores = []
    
    for k in k_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=20, max_iter=500)
        cluster_labels = kmeans.fit_predict(features)
        
        inertias.append(kmeans.inertia_)
        silhouette_scores.append(silhouette_score(features, cluster_labels))
        calinski_scores.append(calinski_harabasz_score(features, cluster_labels))
    
    # Elbow method with improved detection
    if len(inertias) >= 3:
        # Calculate second derivative to find elbow
        second_derivatives = []
        for i in range(1, len(inertias) - 1):
            second_deriv = inertias[i-1] - 2*inertias[i] + inertias[i+1]
            second_derivatives.append(second_deriv)
        
        elbow_k = k_range[second_derivatives.index(max(second_derivatives)) + 1]
    else:
        elbow_k = 5
    
    # Best silhouette score
    silhouette_k = k_range[silhouette_scores.index(max(silhouette_scores))]
    
    # Weighted decision (favor silhouette score but consider elbow)
    if abs(silhouette_k - elbow_k) <= 2:
        optimal_k = silhouette_k
    else:
        # Choose based on silhouette score if difference is significant
        optimal_k = silhouette_k if max(silhouette_scores) > 0.3 else elbow_k
    
    logger.info(f"Elbow method suggests: {elbow_k}")
    logger.info(f"Best silhouette score: {silhouette_k} (score: {max(silhouette_scores):.3f})")
    logger.info(f"Optimal number of clusters determined: {optimal_k}")
    
    return optimal_k, {
        'k_range': list(k_range),
        'inertias': inertias,
        'silhouette_scores': silhouette_scores,
        'calinski_scores': calinski_scores
    }


def create_cluster_labels(cluster_centers, scaler, feature_names):
    """
    Create meaningful labels for clusters based on their characteristics.
    
    Args:
        cluster_centers: Cluster centers from K-means
        scaler: StandardScaler used for normalization
        feature_names: Names of features used in clustering
        
    Returns:
        Dictionary mapping cluster IDs to descriptive labels and characteristics
    """
    # Inverse transform to get original scale
    centers_original = scaler.inverse_transform(cluster_centers)
    
    labels = {}
    for i, center in enumerate(centers_original):
        # Map features back to their meanings
        feature_dict = dict(zip(feature_names, center))
        
        white_pct = feature_dict['white']
        black_pct = feature_dict['black'] 
        draw_pct = feature_dict['draw']
        white_advantage = feature_dict['white_advantage']
        decisiveness = feature_dict['decisiveness']
        
        # Enhanced labeling logic
        label_parts = []
        
        # Primary characteristic
        if draw_pct > 45:
            primary = "Draw-Heavy"
        elif abs(white_advantage) < 3:
            primary = "Balanced"
        elif white_advantage > 10:
            primary = "White Dominant"
        elif white_advantage > 5:
            primary = "White Favored"
        elif white_advantage < -10:
            primary = "Black Dominant"
        elif white_advantage < -5:
            primary = "Black Favored"
        else:
            primary = "Competitive"
        
        label_parts.append(primary)
        
        # Secondary characteristic
        if decisiveness > 85:
            secondary = "Sharp"
        elif decisiveness < 55:
            secondary = "Drawish"
        elif 70 <= decisiveness <= 85:
            secondary = "Tactical"
        else:
            secondary = "Positional"
        
        # Combine characteristics
        if primary != "Draw-Heavy":  # Avoid redundancy
            label_parts.append(secondary)
        
        final_label = " ".join(label_parts)
        
        labels[i] = {
            'label': final_label,
            'characteristics': {
                'white_win_rate': float(white_pct),
                'black_win_rate': float(black_pct),
                'draw_rate': float(draw_pct),
                'white_advantage': float(white_advantage),
                'decisiveness': float(decisiveness),
                'style': secondary if primary != "Draw-Heavy" else "Positional"
            }
        }
    
    return labels


def perform_clustering_analysis(df, logger):
    """
    Perform enhanced clustering analysis with multiple features and validation.
    
    Args:
        df: Cleaned DataFrame with win rates data
        logger: Logger instance for output
        
    Returns:
        Dictionary with comprehensive clustering results
    """
    # Enhanced feature set for clustering
    feature_columns = ["white", "black", "draw", "white_advantage", "decisiveness", "total_log"]
    features = df[feature_columns].values
    
    # Standardize features
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    
    # Determine optimal number of clusters with validation metrics
    optimal_k, cluster_metrics = determine_optimal_clusters(features_scaled, logger=logger)
    
    # Perform K-means clustering with enhanced parameters
    kmeans = KMeans(
        n_clusters=optimal_k, 
        random_state=42, 
        n_init=50,  # More initializations for stability
        max_iter=500,
        algorithm='lloyd'  # More stable algorithm
    )
    cluster_labels = kmeans.fit_predict(features_scaled)
    
    # Add cluster labels to dataframe
    df_clustered = df.copy()
    df_clustered["cluster"] = cluster_labels
    
    # Create enhanced cluster labels
    cluster_label_map = create_cluster_labels(kmeans.cluster_centers_, scaler, feature_columns)
    df_clustered["cluster_label"] = df_clustered["cluster"].map(lambda x: cluster_label_map[x]['label'])
    
    # Perform PCA for visualization (using original 3 features for interpretability)
    pca_features = df[["white", "black", "draw"]].values
    pca_features_scaled = StandardScaler().fit_transform(pca_features)
    pca = PCA(n_components=2)
    features_pca = pca.fit_transform(pca_features_scaled)
    df_clustered["pca_x"] = features_pca[:, 0]
    df_clustered["pca_y"] = features_pca[:, 1]
    
    # Calculate comprehensive cluster statistics
    cluster_stats = []
    for cluster_id in range(optimal_k):
        cluster_data = df_clustered[df_clustered["cluster"] == cluster_id]
        
        # Basic statistics
        stats = {
            "cluster_id": cluster_id,
            "label": cluster_label_map[cluster_id]['label'],
            "characteristics": cluster_label_map[cluster_id]['characteristics'],
            "count": len(cluster_data),
            "percentage_of_total": float(len(cluster_data) / len(df_clustered) * 100),
            
            # Win rate statistics
            "win_rates": {
                "white": {
                    "mean": float(cluster_data["white"].mean()),
                    "std": float(cluster_data["white"].std()),
                    "min": float(cluster_data["white"].min()),
                    "max": float(cluster_data["white"].max())
                },
                "black": {
                    "mean": float(cluster_data["black"].mean()),
                    "std": float(cluster_data["black"].std()),
                    "min": float(cluster_data["black"].min()),
                    "max": float(cluster_data["black"].max())
                },
                "draw": {
                    "mean": float(cluster_data["draw"].mean()),
                    "std": float(cluster_data["draw"].std()),
                    "min": float(cluster_data["draw"].min()),
                    "max": float(cluster_data["draw"].max())
                }
            },
            
            # Game volume statistics
            "game_volume": {
                "total_games": int(cluster_data["total"].sum()),
                "avg_games_per_opening": float(cluster_data["total"].mean()),
                "median_games": float(cluster_data["total"].median()),
                "volume_distribution": cluster_data["volume_category"].value_counts().to_dict()
            },
            
            # Representative openings
            "representative_openings": {
                "most_popular": cluster_data.nlargest(5, "total")[["opening", "total", "white", "black", "draw"]].to_dict('records'),
                "most_white_favored": cluster_data.nlargest(3, "white")[["opening", "white", "total"]].to_dict('records'),
                "most_black_favored": cluster_data.nlargest(3, "black")[["opening", "black", "total"]].to_dict('records'),
                "most_drawish": cluster_data.nlargest(3, "draw")[["opening", "draw", "total"]].to_dict('records')
            }
        }
        cluster_stats.append(stats)
    
    # Calculate clustering quality metrics
    quality_metrics = {
        "silhouette_score": float(silhouette_score(features_scaled, cluster_labels)),
        "calinski_harabasz_score": float(calinski_harabasz_score(features_scaled, cluster_labels)),
        "davies_bouldin_score": float(davies_bouldin_score(features_scaled, cluster_labels)),
        "inertia": float(kmeans.inertia_)
    }
    
    return {
        "clustered_data": df_clustered,
        "cluster_statistics": cluster_stats,
        "pca_explained_variance": pca.explained_variance_ratio_.tolist(),
        "optimal_clusters": optimal_k,
        "cluster_labels": cluster_label_map,
        "quality_metrics": quality_metrics,
        "cluster_selection_metrics": cluster_metrics,
        "feature_importance": {
            "features_used": feature_columns,
            "pca_components": pca.components_.tolist(),
            "pca_feature_names": ["white", "black", "draw"]
        }
    }


def save_clustering_results(results, logger):
    """
    Save comprehensive clustering results to JSON file.
    
    Args:
        results: Dictionary with clustering results
        logger: Logger instance for output
        
    Returns:
        Path to saved JSON file
    """
    output_dir = Path("data/generated_data")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Prepare data for JSON serialization
    df_clustered = results["clustered_data"]
    
    # Convert DataFrame to list of dictionaries with enhanced data
    openings_with_clusters = []
    for _, row in df_clustered.iterrows():
        opening_data = {
            "opening": row["opening"],
            "win_rates": {
                "white": float(row["white"]),
                "black": float(row["black"]),
                "draw": float(row["draw"])
            },
            "derived_metrics": {
                "white_advantage": float(row["white_advantage"]),
                "decisiveness": float(row["decisiveness"]),
                "white_black_ratio": float(row["white_black_ratio"])
            },
            "game_data": {
                "total_games": int(row["total"]),
                "volume_category": row["volume_category"],
                "log_games": float(row["total_log"])
            },
            "cluster_info": {
                "cluster_id": int(row["cluster"]),
                "cluster_label": row["cluster_label"]
            },
            "visualization": {
                "pca_coordinates": {
                    "x": float(row["pca_x"]),
                    "y": float(row["pca_y"])
                }
            }
        }
        openings_with_clusters.append(opening_data)
    
    # Create comprehensive results structure
    final_results = {
        "analysis_metadata": {
            "total_openings_analyzed": len(df_clustered),
            "optimal_clusters": results["optimal_clusters"],
            "features_used": results["feature_importance"]["features_used"],
            "analysis_date": pd.Timestamp.now().isoformat(),
            "pca_explained_variance": {
                "pc1": results["pca_explained_variance"][0],
                "pc2": results["pca_explained_variance"][1],
                "total": sum(results["pca_explained_variance"])
            }
        },
        
        "quality_assessment": results["quality_metrics"],
        
        "cluster_selection_process": results["cluster_selection_metrics"],
        
        "detailed_cluster_statistics": results["cluster_statistics"],
        
        "cluster_summary": {
            cluster_id: {
                "label": info['label'],
                "characteristics": info['characteristics']
            } for cluster_id, info in results["cluster_labels"].items()
        },
        
        "openings_with_clusters": openings_with_clusters,
        
        "insights": {
            "most_decisive_cluster": max(results["cluster_statistics"], 
                                       key=lambda x: x['characteristics']['decisiveness'])['label'],
            "most_balanced_cluster": min(results["cluster_statistics"], 
                                       key=lambda x: abs(x['characteristics']['white_advantage']))['label'],
            "largest_cluster": max(results["cluster_statistics"], 
                                 key=lambda x: x['count'])['label'],
            "highest_volume_cluster": max(results["cluster_statistics"], 
                                        key=lambda x: x['game_volume']['total_games'])['label']
        }
    }
    
    # Save to JSON
    json_file = output_dir / "opening_clusters.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(final_results, f, indent=2, ensure_ascii=False)
    
    log_file_operation(logger, "Enhanced clustering results saved", str(json_file))
    
    # Also save a simplified version for easier consumption
    simplified_results = {
        "clusters": [
            {
                "id": stats["cluster_id"],
                "label": stats["label"],
                "count": stats["count"],
                "characteristics": stats["characteristics"],
                "top_openings": [op["opening"] for op in stats["representative_openings"]["most_popular"][:3]]
            }
            for stats in results["cluster_statistics"]
        ],
        "openings": [
            {
                "name": opening["opening"],
                "cluster": opening["cluster_info"]["cluster_label"],
                "white_win_rate": opening["win_rates"]["white"],
                "black_win_rate": opening["win_rates"]["black"],
                "draw_rate": opening["win_rates"]["draw"],
                "total_games": opening["game_data"]["total_games"]
            }
            for opening in openings_with_clusters
        ]
    }
    
    simplified_file = output_dir / "opening_clusters_simple.json"
    with open(simplified_file, 'w', encoding='utf-8') as f:
        json.dump(simplified_results, f, indent=2, ensure_ascii=False)
    
    log_file_operation(logger, "Simplified clustering results saved", str(simplified_file))
    return json_file


def print_cluster_summary(results, logger):
    """
    Log a comprehensive summary of the clustering results.
    
    Args:
        results: Dictionary with clustering results
        logger: Logger instance for output
    """
    logger.info("="*80)
    logger.info("CHESS OPENING CLUSTERING ANALYSIS SUMMARY")
    logger.info("="*80)
    
    # Overall statistics
    log_data_processing(logger, "Total openings analyzed", len(results['clustered_data']))
    logger.info(f"Optimal number of clusters: {results['optimal_clusters']}")
    logger.info(f"PCA explained variance: {sum(results['pca_explained_variance']):.1%}")
    
    # Quality metrics
    quality = results['quality_metrics']
    logger.info("Clustering Quality Metrics:")
    logger.info(f"  Silhouette Score: {quality['silhouette_score']:.3f} (higher is better, max 1.0)")
    logger.info(f"  Calinski-Harabasz Score: {quality['calinski_harabasz_score']:.1f} (higher is better)")
    logger.info(f"  Davies-Bouldin Score: {quality['davies_bouldin_score']:.3f} (lower is better)")
    
    logger.info("Detailed Cluster Analysis:")
    logger.info("-" * 80)
    
    for stats in results["cluster_statistics"]:
        logger.info(f"🎯 Cluster: {stats['label']}")
        logger.info(f"   Size: {stats['count']} openings ({stats['percentage_of_total']:.1f}% of total)")
        
        # Win rate summary
        wr = stats['win_rates']
        logger.info(f"   Win Rates: White {wr['white']['mean']:.1f}%±{wr['white']['std']:.1f}, "
                   f"Black {wr['black']['mean']:.1f}%±{wr['black']['std']:.1f}, "
                   f"Draw {wr['draw']['mean']:.1f}%±{wr['draw']['std']:.1f}")
        
        # Characteristics
        char = stats['characteristics']
        logger.info(f"   Style: {char['style']}, White Advantage: {char['white_advantage']:+.1f}%, "
                   f"Decisiveness: {char['decisiveness']:.1f}%")
        
        # Game volume
        gv = stats['game_volume']
        logger.info(f"   Games: {gv['total_games']:,} total, {gv['avg_games_per_opening']:.0f} avg per opening")
        
        # Top examples
        top_openings = [f"{op['opening']} ({op['total']})" for op in stats['representative_openings']['most_popular'][:3]]
        logger.info(f"   Top Examples: {', '.join(top_openings)}")
        
        # Distinctive characteristics
        if char['white_advantage'] > 8:
            logger.info(f"   🔥 Highly favorable for White")
        elif char['white_advantage'] < -8:
            logger.info(f"   ⚡ Highly favorable for Black")
        elif char['draw_rate'] > 45:
            logger.info(f"   🤝 Very drawish openings")
        elif char['decisiveness'] > 85:
            logger.info(f"   ⚔️  Sharp, tactical openings")
    
    logger.info("="*80)


def main():
    """Main function to perform clustering analysis."""
    logger = setup_logging(level="INFO", module_name="clustering_analysis")
    logger.info("Chess Opening Clustering Analysis")
    
    # Load data
    df = load_win_rates_data(logger)
    if df is None:
        return
    
    # Clean and prepare data
    df_clean = clean_and_prepare_data(df, logger)
    if len(df_clean) < 10:
        logger.error("Not enough data for clustering analysis")
        return
    
    # Perform clustering analysis
    logger.info("Performing clustering analysis...")
    results = perform_clustering_analysis(df_clean, logger)
    
    # Save results
    logger.info("Saving results...")
    save_clustering_results(results, logger)
    
    # Log summary
    print_cluster_summary(results, logger)
    
    logger.info("Clustering analysis complete!")
    logger.info("Generated files:")
    logger.info("  - data/generated_data/opening_clusters.json")
    logger.info("  - data/generated_data/opening_clusters_simple.json")


if __name__ == "__main__":
    main()