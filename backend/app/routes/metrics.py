# from fastapi import APIRouter, Depends, HTTPException
# from app.dependencies import get_cloudwatch_client
# from datetime import datetime, timedelta

# router = APIRouter()

# @router.get("/cpu")
# async def get_cpu_utilization(instance_id: str, cloudwatch=Depends(get_cloudwatch_client)):
#     """
#     Fetch CPU utilization metrics for an EC2 instance.
#     """
#     try:
#         end_time = datetime.utcnow()
#         start_time = end_time - timedelta(days=7)  # Past 7 days

#         response = cloudwatch.get_metric_statistics(
#             Namespace='AWS/EC2',
#             MetricName='CPUUtilization',
#             Dimensions=[{"Name": "InstanceId", "Value": instance_id}],
#             StartTime=start_time.isoformat(),
#             EndTime=end_time.isoformat(),
#             Period=3600,  # 1-hour intervals
#             Statistics=['Average']
#         )

#         datapoints = response.get("Datapoints", [])
#         if not datapoints:
#             raise HTTPException(status_code=404, detail="No CPU metrics found for this instance.")

#         return {
#             "instance_id": instance_id,
#             "metrics": [{"time": dp["Timestamp"], "value": dp["Average"]} for dp in sorted(datapoints, key=lambda x: x["Timestamp"])]
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching metrics: {str(e)}")


from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_cloudwatch_client
from datetime import datetime, timedelta

router = APIRouter()

def fetch_metric_statistics(cloudwatch, instance_id, metric_name, namespace, statistic="Average", unit=None):
    """
    Fetch statistics for a given metric from CloudWatch.
    """
    try:
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=7)  # Past 7 days

        params = {
            "Namespace": namespace,
            "MetricName": metric_name,
            "Dimensions": [{"Name": "InstanceId", "Value": instance_id}],
            "StartTime": start_time.isoformat(),
            "EndTime": end_time.isoformat(),
            "Period": 3600,  # 1-hour intervals
            "Statistics": [statistic]
        }
        if unit:
            params["Unit"] = unit

        response = cloudwatch.get_metric_statistics(**params)
        datapoints = response.get("Datapoints", [])
            
        return [{"time": dp["Timestamp"], "value": dp[statistic]} for dp in sorted(datapoints, key=lambda x: x["Timestamp"])]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching {metric_name} metrics: {str(e)}")

@router.get("/compiled-metrics")
async def get_instance_metrics(instance_id: str, cloudwatch=Depends(get_cloudwatch_client)):
    """
    Fetch multiple metrics for an EC2 instance.
    """
    try:
        cpu_data = fetch_metric_statistics(cloudwatch, instance_id, "CPUUtilization", "AWS/EC2")
        memory_data = fetch_metric_statistics(cloudwatch, instance_id, "MemoryUtilization", "CWAgent")
        network_in_data = fetch_metric_statistics(cloudwatch, instance_id, "NetworkIn", "AWS/EC2", unit="Bytes")
        network_out_data = fetch_metric_statistics(cloudwatch, instance_id, "NetworkOut", "AWS/EC2", unit="Bytes")

        return {
            "instance_id": instance_id,
            "metrics": {
                "cpu_utilization": cpu_data,
                "memory_utilization": memory_data,
                "network_in": network_in_data,
                "network_out": network_out_data
            }
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
