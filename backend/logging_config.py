"""
Centralized logging configuration for the chess analytics backend.

This module provides a standardized logging setup for all backend components,
replacing print statements with proper logging levels and formatting.
"""

import logging
import sys
from pathlib import Path
from typing import Optional


def setup_logging(
    level: str = "INFO",
    log_file: Optional[str] = None,
    module_name: Optional[str] = None
) -> logging.Logger:
    """
    Set up logging configuration for a module.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path. If None, logs only to console.
        module_name: Name of the module requesting the logger
        
    Returns:
        Configured logger instance
    """
    # Create logger
    logger_name = module_name or __name__
    logger = logging.getLogger(logger_name)
    
    # Avoid duplicate handlers if logger already exists
    if logger.handlers:
        return logger
    
    # Set logging level
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    logger.setLevel(numeric_level)
    
    # Create formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (if specified)
    if log_file:
        # Ensure log directory exists
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(numeric_level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger


def get_logger(module_name: str) -> logging.Logger:
    """
    Get a logger for a specific module.
    
    Args:
        module_name: Name of the module requesting the logger
        
    Returns:
        Logger instance for the module
    """
    return logging.getLogger(module_name)


# Default logging configuration
DEFAULT_LOG_LEVEL = "INFO"
DEFAULT_LOG_DIR = "logs"
DEFAULT_LOG_FILE = "chess_analytics.log"


def setup_default_logging() -> logging.Logger:
    """
    Set up default logging configuration for the entire application.
    
    Returns:
        Root logger instance
    """
    log_file = Path(DEFAULT_LOG_DIR) / DEFAULT_LOG_FILE
    return setup_logging(
        level=DEFAULT_LOG_LEVEL,
        log_file=str(log_file),
        module_name="chess_analytics"
    )


# Performance logging utilities
class PerformanceLogger:
    """Utility class for logging performance metrics."""
    
    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.start_time = None
    
    def start_timer(self, operation: str):
        """Start timing an operation."""
        import time
        self.start_time = time.time()
        self.logger.info(f"Starting {operation}")
    
    def end_timer(self, operation: str):
        """End timing an operation and log the duration."""
        import time
        if self.start_time:
            duration = time.time() - self.start_time
            self.logger.info(f"Completed {operation} in {duration:.2f} seconds")
            self.start_time = None
        else:
            self.logger.warning(f"Timer not started for {operation}")
    
    def log_progress(self, current: int, total: int, operation: str):
        """Log progress for long-running operations."""
        percentage = (current / total) * 100
        self.logger.info(f"{operation}: {current}/{total} ({percentage:.1f}%)")


# Convenience functions for common logging patterns
def log_file_operation(logger: logging.Logger, operation: str, file_path: str, success: bool = True):
    """Log file operations with consistent formatting."""
    if success:
        logger.info(f"✓ {operation}: {file_path}")
    else:
        logger.error(f"✗ {operation}: {file_path}")


def log_data_processing(logger: logging.Logger, stage: str, count: int, total: Optional[int] = None):
    """Log data processing stages with counts."""
    if total:
        logger.info(f"{stage}: {count:,} of {total:,} items")
    else:
        logger.info(f"{stage}: {count:,} items")


def log_error_with_context(logger: logging.Logger, error: Exception, context: str):
    """Log errors with additional context."""
    logger.error(f"Error in {context}: {str(error)}", exc_info=True)


# Initialize default logging
root_logger = setup_default_logging()
