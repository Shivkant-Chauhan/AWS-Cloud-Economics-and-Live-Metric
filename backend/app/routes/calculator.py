from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.post("/cost")
async def calculate_cost(
    users: int,
    instance_capacity: int,
    rds_cost: float = 200.0,
    nat_cost: float = 50.0,
    lb_cost: float = 25.0,
    shield_cost: float = 10.0,
):
    """
    Calculate monthly cloud costs based on usage.
    """
    if users <= 0 or instance_capacity <= 0:
        raise HTTPException(status_code=400, detail="Users and instance capacity must be positive integers.")
    
    instances = (users + instance_capacity - 1) // instance_capacity  # Round up division
    instance_cost = instances * 24 * 30 * 0.10  # Example cost per hour per instance

    total_cost = instance_cost + rds_cost + nat_cost + lb_cost + shield_cost

    return {
        "users": users,
        "instances_needed": instances,
        "total_cost": round(total_cost, 2),
    }
