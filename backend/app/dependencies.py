import boto3
import os
from dotenv import load_dotenv

load_dotenv()

def get_cloudwatch_client():
    """
    Create and return a CloudWatch client using AWS credentials.
    Environment variables or IAM Role will handle credentials.
    """
    try:
        cloudwatch = boto3.client(
            'cloudwatch',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        )
        return cloudwatch
    except Exception as e:
        raise RuntimeError(f"Failed to create CloudWatch client: {e}")

