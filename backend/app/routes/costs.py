from fastapi import APIRouter, HTTPException
import requests
import json
import boto3

router = APIRouter()


def get_aws_service_price(service_code, region, attribute_filters):
    """
    Fetch the price of an AWS service using the AWS Pricing API.

    Args:
        service_code (str): The AWS service code (e.g., "AmazonEC2").
        region (str): AWS region (ignored in Pricing API since it uses "us-east-1").
        attribute_filters (dict): Filters to match specific service attributes.
        debug (bool): Enable detailed logging for debugging.

    Returns:
        float: The price of the service in USD.

    Raises:
        HTTPException: If no price is found or an error occurs.
    """
    print(service_code)
    try:
        client = boto3.client("pricing", region_name="us-east-1")
        filters = [{"Type": "TERM_MATCH", "Field": key, "Value": value} for key, value in attribute_filters.items()]
        response = client.get_products(
            ServiceCode=service_code,
            Filters=filters,
            FormatVersion="aws_v1"
        )
        # print(json.dumps(response, indent=2))

        if not response.get("PriceList"):
            return 0

        total_service_cost = 0.0
        price_list = [json.loads(price) for price in response["PriceList"]]
        for price_item in price_list:
            # print(json.dumps(price_item, indent=2))

            terms = price_item.get("terms", {}).get("OnDemand", {})
            for term_key, term in terms.items():
                for dimension_key, dimension in term.get("priceDimensions", {}).items():
                    price_per_unit = dimension.get("pricePerUnit", {}).get("USD")
                    if price_per_unit:
                        total_service_cost += float(price_per_unit)

        return total_service_cost
    
    except boto3.exceptions.Boto3Error as boto_error:
        raise HTTPException(status_code=500, detail=f"AWS Boto3 error: {str(boto_error)}")
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Error fetching pricing: {str(e)}")


# def get_aws_service_price(service_code, region, attribute_filters):
#     """
#     Use AWS Pricing API for cost calculation.
#     """
#     try:
#         client = boto3.client("pricing", region_name="us-east-1")  # Pricing API is only available in us-east-1
#         filters = [{"Type": "TERM_MATCH", "Field": key, "Value": value} for key, value in attribute_filters.items()]
        
#         response = client.get_products(
#             ServiceCode=service_code,
#             Filters=filters,
#             FormatVersion="aws_v1"
#         )
#         # print(response)

#         if not response["PriceList"]:
#             raise HTTPException(status_code=404, detail="No pricing data found for the specified filters.")

#         # Parse the price from the response
#         # price_list = [json.loads(price) for price in response["PriceList"]]
#         # for price_item in price_list:
#         #     terms = price_item["terms"]["OnDemand"]
#         #     for _, term in terms.items():
#         #         for _, dimension in term["priceDimensions"].items():
#         #             return float(dimension["pricePerUnit"]["USD"])
        
#         price_list = [json.loads(price) for price in response["PriceList"]]
#         for price_item in price_list:
#             print(json.dumps(price_item, indent=2))
#             terms = price_item.get("terms", {}).get("OnDemand", {})
#             for term_key, term in terms.items():
#                 for dimension_key, dimension in term.get("priceDimensions", {}).items():
#                     # Ensure we're processing only USD prices and OnDemand terms
#                     price_per_unit = dimension.get("pricePerUnit", {}).get("USD")
#                     if price_per_unit:
#                         try:
#                             return float(price_per_unit)
#                         except ValueError:
#                             raise HTTPException(status_code=500, detail="Invalid price format in PriceList.")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching pricing: {str(e)}")





@router.post("/compiled")
async def calculate_cost(
    users: int,
    instance_capacity: int,
    region: str = "US East (N. Virginia)"
):
    """
    Calculate AWS service costs dynamically based on user input and pricing data.
    """
    try:
        ec2_price = get_aws_service_price("AmazonEC2", region, {"instanceType": "c5a.4xlarge"})
        rds_price = get_aws_service_price("AmazonRDS", region, {"databaseEngine": "MySQL"})
        nat_price = get_aws_service_price("AmazonVPC", region, {"productFamily": "NAT Gateway"})
        lb_price = get_aws_service_price("AmazonEC2", region, {"productFamily": "Load Balancer"})
        shield_price = 3.00

        # Additional Services
        asg_price = get_aws_service_price("AmazonAutoScaling", region, {"productFamily": "Auto Scaling Group"})
        launch_template_price = get_aws_service_price("AmazonAutoScaling", region, {"productFamily": "Launch Template"}) + 0.25
        elastic_ip_price = get_aws_service_price("AmazonVPC", region, {"productFamily": "IP Address"}) + 52.25
        s3_price = get_aws_service_price("AmazonS3", region, {"productFamily": "Storage", "storageClass": "Standard"}) + 98.282

        instances_needed = -(-users // instance_capacity)
        ec2_total = instances_needed * ec2_price
        rds_total = rds_price
        nat_total = nat_price
        lb_total = lb_price
        shield_total = shield_price
        asg_total = asg_price + 5  # base price is 5

        cloud_total_cost = ec2_total + rds_total + nat_total + lb_total + shield_total + asg_total + launch_template_price + elastic_ip_price + s3_price
        avg_api_call_cost = 2.25
        client_total_cost = (cloud_total_cost/2) + (avg_api_call_cost*users)
        profit_to_company = client_total_cost - cloud_total_cost

        return {
            "instances_needed": instances_needed,
            "breakdown": {
                "EC2": f"${ec2_total:.3f} (for {instances_needed} instances)",
                "RDS": f"${rds_total:.3f}",
                "NAT Gateway": f"${nat_total:.3f}",
                "Load Balancer": f"${lb_total:.3f}",
                "AWS Shield": f"${shield_total:.3f}",
                "S3 Bucket": f"${s3_price:.3f}",
                "Elastic IPs": f"${elastic_ip_price:.3f} (for 7 elastically alloted IPs)",
                "Auto Scaling Groups": f"${asg_total:.3f}",
                "Launch Templates": f"${launch_template_price:.3f}",
            },
            "cloud_cloud_total_cost": f"${cloud_total_cost:.3f}",
            "client_total_cost": f"${client_total_cost:.3f}",
            "profit_to_company": f"${profit_to_company:.3f}",
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating costs: {str(e)}")
