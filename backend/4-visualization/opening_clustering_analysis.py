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
    Clean and prepare the data for clustering.
    
    Args:
        df: DataFrame with win rates data
        
    Returns:
        Cleaned DataFrame ready for clustering
    """
    # Drop rows with missing or invalid data
    df_clean = df.dropna(subset=["white", "black", "draw"]).copy()
    
    # Ensure percentages are valid (0-100)
    df_clean = df_clean[
        (df_clean["white"] >= 0) & (df_clean["white"] <= 100) &
        (df_clean["black"] >= 0) & (df_clean["black"] <= 100) &
        (df_clean["draw"] >= 0) & (df_clean["draw"] <= 100)
    ]
    
    # Filter out openings with very few games (less than 10)
    df_clean = df_clean[df_clean["total"] >= 10]
    
    # Ensure percentages roughly sum to 100 (allow some tolerance for rounding)
    df_clean["percentage_sum"] = df_clean["white"] + df_clean["black"] + df_clean["draw"]
    df_clean = df_clean[
        (df_clean["percentage_sum"] >= 95) & (df_clean["percentage_sum"] <= 105)
    ]
    
    print(f"Data cleaned: {len(df_clean)} openings remaining from {len(df)} original")
    return df_clean.drop("percentage_sum", axis=1)


def determine_optimal_clusters(features, max_k=10):
    """
    Determine optimal number of clusters using elbow method.
    
    Args:
        features: Scaled feature matrix
        max_k: Maximum number of clusters to test
        
    Returns:
        Optimal number of clusters
    """
    inertias = []
    k_range = range(2, min(max_k + 1, len(features) // 2))
    
    for k in k_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(features)
        inertias.append(kmeans.inertia_)
    
    # Simple elbow detection (look for the biggest drop)
    if len(inertias) >= 2:
        drops = [inertias[i] - inertias[i+1] for i in range(len(inertias)-1)]
        optimal_k = k_range[drops.index(max(drops))]
    else:
        optimal_k = 4  # Default fallback
    
    print(f"Optimal number of clusters determined: {optimal_k}")
    return optimal_k


def create_cluster_labels(cluster_centers, scaler):
    """
    Create meaningful labels for clusters based on their characteristics.
    
    Args:
        cluster_centers: Cluster centers from K-means
        scaler: StandardScaler used for normalization
        
    Returns:
        Dictionary mapping cluster IDs to descriptive labels
    """
    # Inverse transform to get original scale
    centers_original = scaler.inverse_transform(cluster_centers)
    
    labels = {}
    for i, center in enumerate(centers_original):
        white_pct, black_pct, draw_pct = center
        
        # Create descriptive labels based on characteristics
        if draw_pct > 40:
            label = "Draw-Heavy"
        elif white_pct > 55:
            label = "White Advantage"
        elif black_pct > 55:
            label = "Black Advantage"
        elif abs(white_pct - black_pct) < 5:
            label = "Balanced"
        elif white_pct > black_pct:
            label = "Slight White Edge"
        else:
            label = "Slight Black Edge"
        
        # Add intensity modifier
        total_decisive = white_pct + black_pct
        if total_decisive > 80:
            label += " (Decisive)"
        elif total_decisive < 60:
            label += " (Drawish)"
        
        labels[i] = label
    
    return labels


def perform_clustering_analysis(df):
    """
    Perform the main clustering analysis.
    
    Args:
        df: Cleaned DataFrame with win rates data
        
    Returns:
        Dictionary with clustering results
    """
    # Prepare features for clustering
    features = df[["white", "black", "draw"]].values
    
    # Standardize features
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    
    # Determine optimal number of clusters
    optimal_k = determine_optimal_clusters(features_scaled)
    
    # Perform K-means clustering
    kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(features_scaled)
    
    # Add cluster labels to dataframe
    df_clustered = df.copy()
    df_clustered["cluster"] = cluster_labels
    
    # Create meaningful cluster labels
    cluster_label_map = create_cluster_labels(kmeans.cluster_centers_, scaler)
    df_clustered["cluster_label"] = df_clustered["cluster"].map(cluster_label_map)
    
    # Perform PCA for visualization
    pca = PCA(n_components=2)
    features_pca = pca.fit_transform(features_scaled)
    df_clustered["pca_x"] = features_pca[:, 0]
    df_clustered["pca_y"] = features_pca[:, 1]
    
    # Calculate cluster statistics
    cluster_stats = []
    for cluster_id in range(optimal_k):
        cluster_data = df_clustered[df_clustered["cluster"] == cluster_id]
        
        stats = {
            "cluster_id": cluster_id,
            "label": cluster_label_map[cluster_id],
            "count": len(cluster_data),
            "avg_white": float(cluster_data["white"].mean()),
            "avg_black": float(cluster_data["black"].mean()),
            "avg_draw": float(cluster_data["draw"].mean()),
            "avg_total_games": float(cluster_data["total"].mean()),
            "example_openings": cluster_data.nlargest(3, "total")["opening"].tolist()
        }
        cluster_stats.append(stats)
    
    return {
        "clustered_data": df_clustered,
        "cluster_statistics": cluster_stats,
        "pca_explained_variance": pca.explained_variance_ratio_.tolist(),
        "optimal_clusters": optimal_k,
        "cluster_labels": cluster_label_map
    }


def create_cluster_visualization(results):
    """
    Create and save cluster visualization plot.
    
    Args:
        results: Dictionary with clustering results
        
    Returns:
        Path to saved visualization file
    """
    df_clustered = results["clustered_data"]
    cluster_stats = results["cluster_statistics"]
    pca_variance = results["pca_explained_variance"]
    
    # Set up the plot
    plt.style.use('default')
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 8))
    
    # Main cluster plot
    colors = plt.cm.Set3(np.linspace(0, 1, results["optimal_clusters"])) # type: ignore
    
    for i, stats in enumerate(cluster_stats):
        cluster_data = df_clustered[df_clustered["cluster"] == i]
        ax1.scatter(
            cluster_data["pca_x"], 
            cluster_data["pca_y"],
            c=[colors[i]], 
            label=f'{stats["label"]} ({stats["count"]})',
            alpha=0.7,
            s=60,
            edgecolors='black',
            linewidth=0.5
        )
    
    # Annotate most popular openings
    top_openings = df_clustered.nlargest(12, "total")
    for _, row in top_openings.iterrows():
        ax1.annotate(
            row["opening"][:20] + ("..." if len(row["opening"]) > 20 else ""),
            (row["pca_x"], row["pca_y"]),
            xytext=(5, 5),
            textcoords='offset points',
            fontsize=8,
            alpha=0.8,
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.7)
        )
    
    ax1.set_title("Chess Opening Clusters by Win/Loss/Draw Patterns", fontsize=14, fontweight='bold')
    ax1.set_xlabel(f"PC1 ({pca_variance[0]:.1%} of variance)", fontsize=12)
    ax1.set_ylabel(f"PC2 ({pca_variance[1]:.1%} of variance)", fontsize=12)
    ax1.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    ax1.grid(True, alpha=0.3)
    
    # Cluster characteristics bar plot
    cluster_names = [stats["label"] for stats in cluster_stats]
    white_avgs = [stats["avg_white"] for stats in cluster_stats]
    black_avgs = [stats["avg_black"] for stats in cluster_stats]
    draw_avgs = [stats["avg_draw"] for stats in cluster_stats]
    
    x = np.arange(len(cluster_names))
    width = 0.25
    
    ax2.bar(x - width, white_avgs, width, label='White Win %', color='lightblue')
    ax2.bar(x, black_avgs, width, label='Black Win %', color='lightcoral')
    ax2.bar(x + width, draw_avgs, width, label='Draw %', color='lightgray')
    
    ax2.set_title("Average Win Rates by Cluster", fontsize=14, fontweight='bold')
    ax2.set_xlabel("Cluster")
    ax2.set_ylabel("Percentage")
    ax2.set_xticks(x)
    ax2.set_xticklabels([name.replace(" ", "\n") for name in cluster_names], fontsize=10)
    ax2.legend()
    ax2.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    
    # Save the plot
    output_dir = Path("data/generated_data")
    output_dir.mkdir(parents=True, exist_ok=True)
    plot_file = output_dir / "opening_cluster_visualization.png"
    
    plt.savefig(plot_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✓ Visualization saved: {plot_file}")
    return plot_file


def save_clustering_results(results):
    """
    Save clustering results to JSON file.
    
    Args:
        results: Dictionary with clustering results
        
    Returns:
        Path to saved JSON file
    """
    output_dir = Path("data/generated_data")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Prepare data for JSON serialization
    df_clustered = results["clustered_data"]
    
    # Convert DataFrame to list of dictionaries
    openings_with_clusters = []
    for _, row in df_clustered.iterrows():
        openings_with_clusters.append({
            "opening": row["opening"],
            "white_win_pct": float(row["white"]),
            "black_win_pct": float(row["black"]),
            "draw_pct": float(row["draw"]),
            "total_games": int(row["total"]),
            "cluster_id": int(row["cluster"]),
            "cluster_label": row["cluster_label"],
            "pca_coordinates": {
                "x": float(row["pca_x"]),
                "y": float(row["pca_y"])
            }
        })
    
    # Create final results structure
    final_results = {
        "clustering_metadata": {
            "total_openings_analyzed": len(df_clustered),
            "optimal_clusters": results["optimal_clusters"],
            "pca_explained_variance": {
                "pc1": results["pca_explained_variance"][0],
                "pc2": results["pca_explained_variance"][1],
                "total": sum(results["pca_explained_variance"])
            }
        },
        "cluster_statistics": results["cluster_statistics"],
        "openings_with_clusters": openings_with_clusters,
        "cluster_labels": results["cluster_labels"]
    }
    
    # Save to JSON
    json_file = output_dir / "opening_clusters.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(final_results, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Clustering results saved: {json_file}")
    return json_file


def print_cluster_summary(results):
    """
    Print a summary of the clustering results.
    
    Args:
        results: Dictionary with clustering results
    """
    print("\n" + "="*60)
    print("CHESS OPENING CLUSTERING ANALYSIS SUMMARY")
    print("="*60)
    
    print(f"Total openings analyzed: {len(results['clustered_data'])}")
    print(f"Optimal number of clusters: {results['optimal_clusters']}")
    print(f"PCA explained variance: {sum(results['pca_explained_variance']):.1%}")
    
    print("\nCluster Breakdown:")
    print("-" * 40)
    
    for stats in results["cluster_statistics"]:
        print(f"\nCluster: {stats['label']}")
        print(f"  Openings: {stats['count']}")
        print(f"  Avg Win Rates - White: {stats['avg_white']:.1f}%, Black: {stats['avg_black']:.1f}%, Draw: {stats['avg_draw']:.1f}%")
        print(f"  Avg Games per Opening: {stats['avg_total_games']:.0f}")
        print(f"  Examples: {', '.join(stats['example_openings'])}")
    
    print("\n" + "="*60)


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