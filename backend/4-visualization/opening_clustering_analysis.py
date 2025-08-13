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
from pathlib import Path


def load_win_rates_data():
    """
    Load win rates data from the generated visualization files.
    
    Returns:
        DataFrame with opening win rates data
    """
    possible_paths = [
        "backend/data/generated_data/opening_win_rates_complete.json",
        "data/generated_data/opening_win_rates_complete.json",
        "visualization_data/opening_win_rates_complete.json",
        "4-visualization/visualization_data/opening_win_rates_complete.json"
    ]
    
    for path in possible_paths:
        try:
            df = pd.read_json(path)
            print(f"✓ Loaded data from: {path}")
            return df
        except FileNotFoundError:
            continue
        except Exception as e:
            print(f"Error loading {path}: {e}")
            continue
    
    print("Error: Could not find win rates data file.")
    print("Please run generate_visualization_data.py first.")
    return None


def clean_and_prepare_data(df):
    """
    Clean and prepare the data for clustering with enhanced features.
    
    Args:
        df: DataFrame with win rates data
        
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
    
    print(f"Data cleaned: {len(df_clean)} openings remaining from {len(df)} original")
    print(f"Game count threshold applied: {total_games_threshold:.0f}")
    return df_clean.drop("percentage_sum", axis=1)


def determine_optimal_clusters(features, max_k=12):
    """
    Determine optimal number of clusters using multiple methods.
    
    Args:
        features: Scaled feature matrix
        max_k: Maximum number of clusters to test
        
    Returns:
        Optimal number of clusters
    """
    from sklearn.metrics import silhouette_score, calinski_harabasz_score
    
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
    
    print(f"Elbow method suggests: {elbow_k}")
    print(f"Best silhouette score: {silhouette_k} (score: {max(silhouette_scores):.3f})")
    print(f"Optimal number of clusters determined: {optimal_k}")
    
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


def perform_clustering_analysis(df):
    """
    Perform enhanced clustering analysis with multiple features and validation.
    
    Args:
        df: Cleaned DataFrame with win rates data
        
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
    optimal_k, cluster_metrics = determine_optimal_clusters(features_scaled)
    
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
    from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
    
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


def create_cluster_visualization(results):
    """
    Create enhanced cluster visualization with multiple plots.
    
    Args:
        results: Dictionary with clustering results
        
    Returns:
        Path to saved visualization file
    """
    df_clustered = results["clustered_data"]
    cluster_stats = results["cluster_statistics"]
    pca_variance = results["pca_explained_variance"]
    
    # Set up the plot with more subplots
    plt.style.use('default')
    fig = plt.figure(figsize=(20, 12))
    
    # Create a 2x3 grid
    gs = fig.add_gridspec(2, 3, hspace=0.3, wspace=0.3)
    
    # Main cluster plot (top left, spans 2 columns)
    ax1 = fig.add_subplot(gs[0, :2])
    
    # Generate distinct colors
    colors = plt.cm.tab10(np.linspace(0, 1, results["optimal_clusters"])) # type: ignore
    
    # Plot clusters with size based on game volume
    for i, stats in enumerate(cluster_stats):
        cluster_data = df_clustered[df_clustered["cluster"] == i]
        
        # Size points based on total games (log scale)
        sizes = np.log1p(cluster_data["total"]) * 8
        
        scatter = ax1.scatter(
            cluster_data["pca_x"], 
            cluster_data["pca_y"],
            c=[colors[i]], 
            label=f'{stats["label"]} ({stats["count"]})',
            alpha=0.7,
            s=sizes,
            edgecolors='black',
            linewidth=0.5
        )
    
    # Annotate most popular openings
    top_openings = df_clustered.nlargest(8, "total")
    for _, row in top_openings.iterrows():
        ax1.annotate(
            row["opening"][:25] + ("..." if len(row["opening"]) > 25 else ""),
            (row["pca_x"], row["pca_y"]),
            xytext=(5, 5),
            textcoords='offset points',
            fontsize=9,
            alpha=0.9,
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.8, edgecolor='gray')
        )
    
    ax1.set_title("Chess Opening Clusters by Win/Loss/Draw Patterns\n(Point size = game volume)", 
                  fontsize=14, fontweight='bold')
    ax1.set_xlabel(f"PC1 ({pca_variance[0]:.1%} of variance)", fontsize=12)
    ax1.set_ylabel(f"PC2 ({pca_variance[1]:.1%} of variance)", fontsize=12)
    ax1.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=10)
    ax1.grid(True, alpha=0.3)
    
    # Win rates comparison (top right)
    ax2 = fig.add_subplot(gs[0, 2])
    cluster_names = [stats["label"][:15] for stats in cluster_stats]  # Truncate long names
    white_avgs = [stats["win_rates"]["white"]["mean"] for stats in cluster_stats]
    black_avgs = [stats["win_rates"]["black"]["mean"] for stats in cluster_stats]
    draw_avgs = [stats["win_rates"]["draw"]["mean"] for stats in cluster_stats]
    
    x = np.arange(len(cluster_names))
    width = 0.25
    
    ax2.bar(x - width, white_avgs, width, label='White Win %', color='lightblue', alpha=0.8)
    ax2.bar(x, black_avgs, width, label='Black Win %', color='lightcoral', alpha=0.8)
    ax2.bar(x + width, draw_avgs, width, label='Draw %', color='lightgray', alpha=0.8)
    
    ax2.set_title("Average Win Rates by Cluster", fontsize=12, fontweight='bold')
    ax2.set_xlabel("Cluster")
    ax2.set_ylabel("Percentage")
    ax2.set_xticks(x)
    ax2.set_xticklabels([name.replace(" ", "\n") for name in cluster_names], fontsize=8, rotation=45)
    ax2.legend(fontsize=9)
    ax2.grid(True, alpha=0.3, axis='y')
    
    # White advantage vs Decisiveness scatter (bottom left)
    ax3 = fig.add_subplot(gs[1, 0])
    
    for i, stats in enumerate(cluster_stats):
        cluster_data = df_clustered[df_clustered["cluster"] == i]
        ax3.scatter(
            cluster_data["white_advantage"],
            cluster_data["decisiveness"],
            c=[colors[i]],
            label=stats["label"],
            alpha=0.6,
            s=40
        )
    
    ax3.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax3.axhline(y=70, color='gray', linestyle='--', alpha=0.5)
    ax3.set_title("White Advantage vs Decisiveness", fontsize=12, fontweight='bold')
    ax3.set_xlabel("White Advantage (%)")
    ax3.set_ylabel("Decisiveness (% non-draws)")
    ax3.grid(True, alpha=0.3)
    ax3.legend(fontsize=8, loc='best')
    
    # Cluster size and game volume (bottom middle)
    ax4 = fig.add_subplot(gs[1, 1])
    
    cluster_counts = [stats["count"] for stats in cluster_stats]
    total_games = [stats["game_volume"]["total_games"] for stats in cluster_stats]
    
    bars = ax4.bar(range(len(cluster_names)), cluster_counts, color=colors, alpha=0.7)
    ax4.set_title("Cluster Sizes", fontsize=12, fontweight='bold')
    ax4.set_xlabel("Cluster")
    ax4.set_ylabel("Number of Openings")
    ax4.set_xticks(range(len(cluster_names)))
    ax4.set_xticklabels([f"C{i}" for i in range(len(cluster_names))])
    
    # Add game volume as text on bars
    for i, (bar, games) in enumerate(zip(bars, total_games)):
        height = bar.get_height()
        ax4.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                f'{games:,}', ha='center', va='bottom', fontsize=8, rotation=90)
    
    ax4.grid(True, alpha=0.3, axis='y')
    
    # Quality metrics (bottom right)
    ax5 = fig.add_subplot(gs[1, 2])
    
    quality = results['quality_metrics']
    metrics = ['Silhouette\nScore', 'Calinski-\nHarabasz', 'Davies-\nBouldin']
    values = [quality['silhouette_score'], 
              quality['calinski_harabasz_score'] / 100,  # Scale down for visualization
              1 - quality['davies_bouldin_score']]  # Invert so higher is better
    
    bars = ax5.bar(metrics, values, color=['green', 'blue', 'orange'], alpha=0.7)
    ax5.set_title("Clustering Quality Metrics", fontsize=12, fontweight='bold')
    ax5.set_ylabel("Score (normalized)")
    ax5.grid(True, alpha=0.3, axis='y')
    
    # Add actual values as text
    for bar, actual_val in zip(bars, [quality['silhouette_score'], 
                                     quality['calinski_harabasz_score'], 
                                     quality['davies_bouldin_score']]):
        height = bar.get_height()
        ax5.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                f'{actual_val:.3f}', ha='center', va='bottom', fontsize=9)
    
    plt.suptitle("Enhanced Chess Opening Clustering Analysis", fontsize=16, fontweight='bold', y=0.98)
    
    # Save the plot
    output_dir = Path("data/generated_data")
    output_dir.mkdir(parents=True, exist_ok=True)
    plot_file = output_dir / "opening_cluster_visualization.png"
    
    plt.savefig(plot_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✓ Enhanced visualization saved: {plot_file}")
    return plot_file


def save_clustering_results(results):
    """
    Save comprehensive clustering results to JSON file.
    
    Args:
        results: Dictionary with clustering results
        
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
    
    print(f"✓ Enhanced clustering results saved: {json_file}")
    
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
    
    print(f"✓ Simplified clustering results saved: {simplified_file}")
    return json_file


def print_cluster_summary(results):
    """
    Print a comprehensive summary of the clustering results.
    
    Args:
        results: Dictionary with clustering results
    """
    print("\n" + "="*80)
    print("ENHANCED CHESS OPENING CLUSTERING ANALYSIS SUMMARY")
    print("="*80)
    
    # Overall statistics
    print(f"Total openings analyzed: {len(results['clustered_data'])}")
    print(f"Optimal number of clusters: {results['optimal_clusters']}")
    print(f"PCA explained variance: {sum(results['pca_explained_variance']):.1%}")
    
    # Quality metrics
    quality = results['quality_metrics']
    print(f"\nClustering Quality Metrics:")
    print(f"  Silhouette Score: {quality['silhouette_score']:.3f} (higher is better, max 1.0)")
    print(f"  Calinski-Harabasz Score: {quality['calinski_harabasz_score']:.1f} (higher is better)")
    print(f"  Davies-Bouldin Score: {quality['davies_bouldin_score']:.3f} (lower is better)")
    
    print("\nDetailed Cluster Analysis:")
    print("-" * 80)
    
    for stats in results["cluster_statistics"]:
        print(f"\n🎯 Cluster: {stats['label']}")
        print(f"   Size: {stats['count']} openings ({stats['percentage_of_total']:.1f}% of total)")
        
        # Win rate summary
        wr = stats['win_rates']
        print(f"   Win Rates: White {wr['white']['mean']:.1f}%±{wr['white']['std']:.1f}, "
              f"Black {wr['black']['mean']:.1f}%±{wr['black']['std']:.1f}, "
              f"Draw {wr['draw']['mean']:.1f}%±{wr['draw']['std']:.1f}")
        
        # Characteristics
        char = stats['characteristics']
        print(f"   Style: {char['style']}, White Advantage: {char['white_advantage']:+.1f}%, "
              f"Decisiveness: {char['decisiveness']:.1f}%")
        
        # Game volume
        gv = stats['game_volume']
        print(f"   Games: {gv['total_games']:,} total, {gv['avg_games_per_opening']:.0f} avg per opening")
        
        # Top examples
        top_openings = [f"{op['opening']} ({op['total']})" for op in stats['representative_openings']['most_popular'][:3]]
        print(f"   Top Examples: {', '.join(top_openings)}")
        
        # Distinctive characteristics
        if char['white_advantage'] > 8:
            print(f"   🔥 Highly favorable for White")
        elif char['white_advantage'] < -8:
            print(f"   ⚡ Highly favorable for Black")
        elif char['draw_rate'] > 45:
            print(f"   🤝 Very drawish openings")
        elif char['decisiveness'] > 85:
            print(f"   ⚔️  Sharp, tactical openings")
    
    print("\n" + "="*80)
    print("💡 Insights:")
    
    # Generate insights
    total_openings = len(results['clustered_data'])
    white_dominant = sum(1 for s in results['cluster_statistics'] if s['characteristics']['white_advantage'] > 5)
    black_dominant = sum(1 for s in results['cluster_statistics'] if s['characteristics']['white_advantage'] < -5)
    balanced = results['optimal_clusters'] - white_dominant - black_dominant
    
    print(f"   • {white_dominant} cluster(s) favor White, {black_dominant} favor Black, {balanced} are balanced")
    
    # Find most distinctive clusters
    most_decisive = max(results['cluster_statistics'], key=lambda x: x['characteristics']['decisiveness'])
    most_drawish = min(results['cluster_statistics'], key=lambda x: x['characteristics']['decisiveness'])
    
    print(f"   • Most decisive style: {most_decisive['label']} ({most_decisive['characteristics']['decisiveness']:.1f}% decisive)")
    print(f"   • Most drawish style: {most_drawish['label']} ({most_drawish['characteristics']['draw_rate']:.1f}% draws)")
    
    print("="*80)


def main():
    """Main function to perform clustering analysis."""
    print("Chess Opening Clustering Analysis")
    print("=" * 40)
    
    # Load data
    df = load_win_rates_data()
    if df is None:
        return
    
    # Clean and prepare data
    df_clean = clean_and_prepare_data(df)
    if len(df_clean) < 10:
        print("Error: Not enough data for clustering analysis.")
        return
    
    # Perform clustering analysis
    print("\nPerforming clustering analysis...")
    results = perform_clustering_analysis(df_clean)
    
    # Create visualization
    print("\nCreating visualization...")
    create_cluster_visualization(results)
    
    # Save results
    print("\nSaving results...")
    save_clustering_results(results)
    
    # Print summary
    print_cluster_summary(results)
    
    print("\n✓ Clustering analysis complete!")
    print("Generated files:")
    print("  - data/generated_data/opening_clusters.json")
    print("  - data/generated_data/opening_cluster_visualization.png")


if __name__ == "__main__":
    main()