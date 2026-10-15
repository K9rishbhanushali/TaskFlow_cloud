"""S3 storage adapter (cloud mode, Phase 9).

Uses the EC2 IAM role when available; falls back to explicit env credentials
only if provided (never hardcode them). Bucket stays private; downloads use
short-lived presigned URLs (default 15 minutes).
"""
import boto3
from botocore.exceptions import ClientError


class S3Storage:
    name = "s3"

    def __init__(self, bucket, region="", prefix="study-files/"):
        if not bucket:
            raise ValueError("S3_BUCKET is required when STORAGE_BACKEND=s3.")
        self.bucket = bucket
        self.prefix = prefix if prefix.endswith("/") else prefix + "/"
        self.client = boto3.client("s3", region_name=region or None)

    def _full_key(self, key):
        return key if key.startswith(self.prefix) else self.prefix + key

    def save(self, file_stream, key):
        file_stream.seek(0)
        self.client.upload_fileobj(file_stream, self.bucket, self._full_key(key))
        return key

    def delete(self, key):
        try:
            self.client.delete_object(Bucket=self.bucket, Key=self._full_key(key))
        except ClientError:
            pass

    def presigned_url(self, key, filename, expires=900):
        return self.client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.bucket,
                "Key": self._full_key(key),
                "ResponseContentDisposition": f'attachment; filename="{filename}"',
            },
            ExpiresIn=expires,
        )
