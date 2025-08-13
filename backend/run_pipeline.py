#!/usr/bin/env python3
"""
Chess Data Analysis Pipeline Runner

This script runs the complete data processing pipeline in the correct order.
Each step depends on the output of the previous step.

Pipeline Steps:
1. PGN to CSV conversion
2. Engine analysis and game processing  
3. Opening statistics generation
4. Visualization data generation
5. Clustering analysis

Usage: python run_pipeline.py [--step N] [--from-step N]
"""

import sys
import os
import subprocess
import argparse
from pathlib import Path


def run_step(step_number, script_name, description):
    """
    Run a single pipeline step.
    
    Args:
        step_number: Step number for display
        script_name: Name of the Python script to run
        description: Description of what this step does
        
    Returns:
        True if successful, False otherwise
    """
    print(f"\n{'='*60}")
    print(f"STEP {step_number}: {description}")
    print(f"Running: {script_name}")
    print('='*60)
    
    script_path = Path("backend/data_pipeline") / script_name
    
    if not script_path.exists():
        print(f"Error: Script {script_path} not found!")
        return False
    
    try:
        result = subprocess.run([sys.executable, str(script_path)], 
                              capture_output=False, 
                              text=True, 
                              cwd=Path.cwd())
        
        if result.returncode == 0:
            print(f"✓ Step {step_number} completed successfully")
            return True
        else:
            print(f"✗ Step {step_number} failed with return code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"✗ Step {step_number} failed with error: {e}")
        return False


def main():
    """Main pipeline runner function."""
    parser = argparse.ArgumentParser(description="Run chess data analysis pipeline")
    parser.add_argument("--step", type=int, help="Run only a specific step (1-5)")
    parser.add_argument("--from-step", type=int, help="Start from a specific step")
    parser.add_argument("--list", action="store_true", help="List all pipeline steps")
    
    args = parser.parse_args()
    
    # Define pipeline steps
    pipeline_steps = [
        (1, "01_pgn_to_csv.py", "Convert PGN files to CSV format"),
        (2, "02_engine_analysis.py", "Process games and extract metadata"),
        (3, "03_opening_stats.py", "Generate opening statistics with engine analysis"),
        (4, "04_visualization_data.py", "Create visualization data files"),
        (5, "05_clustering_analysis.py", "Perform K-means clustering analysis")
    ]
    
    if args.list:
        print("Chess Data Analysis Pipeline Steps:")
        print("="*50)
        for step_num, script, desc in pipeline_steps:
            print(f"Step {step_num}: {desc}")
            print(f"  Script: {script}")
        return
    
    print("Chess Data Analysis Pipeline")
    print("="*40)
    print("This pipeline will process chess data through multiple stages.")
    print("Each step depends on the output of previous steps.")
    
    # Determine which steps to run
    if args.step:
        # Run only specific step
        steps_to_run = [step for step in pipeline_steps if step[0] == args.step]
        if not steps_to_run:
            print(f"Error: Invalid step number {args.step}. Valid steps are 1-5.")
            return
    elif args.from_step:
        # Run from specific step onwards
        steps_to_run = [step for step in pipeline_steps if step[0] >= args.from_step]
        if not steps_to_run:
            print(f"Error: Invalid step number {args.from_step}. Valid steps are 1-5.")
            return
    else:
        # Run all steps
        steps_to_run = pipeline_steps
    
    print(f"\nWill run {len(steps_to_run)} step(s)")
    
    # Create output directory
    output_dir = Path("data/generated_data")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Run pipeline steps
    successful_steps = 0
    total_steps = len(steps_to_run)
    
    for step_num, script, description in steps_to_run:
        success = run_step(step_num, script, description)
        
        if success:
            successful_steps += 1
        else:
            print(f"\n❌ Pipeline failed at step {step_num}")
            print("Please check the error messages above and fix any issues.")
            break
    
    # Final summary
    print(f"\n{'='*60}")
    print("PIPELINE SUMMARY")
    print('='*60)
    
    if successful_steps == total_steps:
        print(f"✅ Pipeline completed successfully!")
        print(f"All {total_steps} steps executed without errors.")
        print(f"\nGenerated files are in: {output_dir}")
        
        # List generated files
        if output_dir.exists():
            generated_files = list(output_dir.glob("*.json")) + list(output_dir.glob("*.png"))
            if generated_files:
                print(f"\nGenerated {len(generated_files)} files:")
                for file in sorted(generated_files):
                    print(f"  - {file.name}")
    else:
        print(f"❌ Pipeline incomplete: {successful_steps}/{total_steps} steps completed")
        print("Please fix the errors and re-run the pipeline.")
    
    print('='*60)


if __name__ == "__main__":
    main()