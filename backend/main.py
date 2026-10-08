from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid

from products import products


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="ShopCircle API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# BASIC ROUTES
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to ShopCircle API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ShopCircle API"
    }


@app.get("/products")
def get_products():
    return products


# ============================================================
# RECOMMENDATION ENGINE
# ============================================================

class RecommendationRequest(BaseModel):
    budget: int
    coding_priority: int = 5
    gaming_priority: int = 5
    battery_priority: int = 5


@app.post("/recommend")
def recommend_products(request: RecommendationRequest):

    recommendations = []

    # --------------------------------------------------------
    # Total priority
    # --------------------------------------------------------

    total_priority = (
        request.coding_priority
        + request.gaming_priority
        + request.battery_priority
    )

    # Prevent invalid negative priorities
    coding_priority = max(0, request.coding_priority)
    gaming_priority = max(0, request.gaming_priority)
    battery_priority = max(0, request.battery_priority)

    total_priority = (
        coding_priority
        + gaming_priority
        + battery_priority
    )

    for product in products:

        # ----------------------------------------------------
        # Budget Score
        # ----------------------------------------------------

        if product["price"] <= request.budget:
            budget_score = 10

        elif product["price"] <= request.budget + 10000:
            budget_score = 7

        elif product["price"] <= request.budget + 20000:
            budget_score = 4

        else:
            budget_score = 1

        # ----------------------------------------------------
        # Performance Score
        # ----------------------------------------------------

        if total_priority == 0:
            performance_score = 0

        else:
            performance_score = (
                product["coding"] * coding_priority
                + product["gaming"] * gaming_priority
                + product["battery"] * battery_priority
            ) / total_priority

        # ----------------------------------------------------
        # Final Score
        # ----------------------------------------------------

        final_score = (
            budget_score * 0.30
            + performance_score * 0.70
        )

        match_score = round(final_score * 10, 1)

        # ----------------------------------------------------
        # Reasons
        # ----------------------------------------------------

        reasons = []

        if product["price"] <= request.budget:
            reasons.append("Fits your budget")

        elif product["price"] <= request.budget + 10000:
            reasons.append("Slightly above your budget")

        elif product["price"] <= request.budget + 20000:
            reasons.append("Above your budget")

        else:
            reasons.append("Far above your budget")

        if product["coding"] >= 9:
            reasons.append("Excellent for coding")

        elif product["coding"] >= 8:
            reasons.append("Good for coding")

        if product["gaming"] >= 9:
            reasons.append("Excellent for gaming")

        elif product["gaming"] >= 8:
            reasons.append("Good for gaming")

        if product["battery"] >= 9:
            reasons.append("Excellent battery life")

        elif product["battery"] >= 8:
            reasons.append("Good battery life")

        recommendations.append({
            "product": product,
            "match_score": match_score,
            "reasons": reasons
        })

    # --------------------------------------------------------
    # Highest match first
    # --------------------------------------------------------

    recommendations.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    # IMPORTANT:
    # Frontend expects response.data.recommendations
    return {
        "recommendations": recommendations
    }


# ============================================================
# SMART PRODUCT COMPARISON
# ============================================================

class CompareRequest(BaseModel):
    product_ids: list[int]
    coding_priority: int = 5
    gaming_priority: int = 5
    battery_priority: int = 5


@app.post("/compare")
def compare_products(request: CompareRequest):

    selected_products = []

    for product_id in request.product_ids:

        for product in products:

            if product["id"] == product_id:
                selected_products.append(product)
                break

    # --------------------------------------------------------
    # Validate product selection
    # --------------------------------------------------------

    if len(selected_products) < 2:
        return {
            "message": "Please select at least 2 products to compare."
        }

    # --------------------------------------------------------
    # Prevent negative priorities
    # --------------------------------------------------------

    coding_priority = max(0, request.coding_priority)
    gaming_priority = max(0, request.gaming_priority)
    battery_priority = max(0, request.battery_priority)

    total_priority = (
        coding_priority
        + gaming_priority
        + battery_priority
    )

    comparison = []

    for product in selected_products:

        # ----------------------------------------------------
        # Weighted Personal Score
        # ----------------------------------------------------

        if total_priority == 0:
            weighted_score = 0

        else:
            weighted_score = (
                product["coding"] * coding_priority
                + product["gaming"] * gaming_priority
                + product["battery"] * battery_priority
            ) / total_priority

        # ----------------------------------------------------
        # Reasons
        # ----------------------------------------------------

        reasons = []

        if product["coding"] >= coding_priority:
            reasons.append("Strong choice for coding")

        if product["gaming"] >= gaming_priority:
            reasons.append("Good for gaming")

        if product["battery"] >= battery_priority:
            reasons.append("Good battery match")

        comparison.append({
            "product": product,
            "personal_score": round(weighted_score * 10, 1),
            "reasons": reasons
        })

    # --------------------------------------------------------
    # Highest personal score first
    # --------------------------------------------------------

    comparison.sort(
        key=lambda x: x["personal_score"],
        reverse=True
    )

    return {
        "comparison": comparison,
        "best_match": comparison[0]["product"],
        "best_match_score": comparison[0]["personal_score"]
    }


# ============================================================
# DECISION ROOMS
# ============================================================

# Temporary in-memory storage
rooms = {}


# ============================================================
# CREATE ROOM
# ============================================================

class CreateRoomRequest(BaseModel):
    room_name: str
    creator_name: str


@app.post("/rooms")
def create_room(request: CreateRoomRequest):

    room_id = f"ROOM-{uuid.uuid4().hex[:6].upper()}"

    rooms[room_id] = {
        "room_id": room_id,
        "room_name": request.room_name,
        "creator": request.creator_name,

        "members": [
            {
                "name": request.creator_name,
                "vote": None
            }
        ],

        "products": [],

        "votes": {}
    }

    return {
        "message": "Decision Room created successfully",
        "room": rooms[room_id]
    }


# ============================================================
# GET ROOM
# ============================================================

@app.get("/rooms/{room_id}")
def get_room(room_id: str):

    if room_id not in rooms:
        return {
            "message": "Room not found"
        }

    return {
        "room": rooms[room_id]
    }


# ============================================================
# ADD PRODUCT TO ROOM
# ============================================================

class AddProductRequest(BaseModel):
    room_id: str
    product_id: int


@app.post("/rooms/add-product")
def add_product_to_room(request: AddProductRequest):

    if request.room_id not in rooms:
        return {
            "message": "Room not found"
        }

    selected_product = None

    for product in products:

        if product["id"] == request.product_id:
            selected_product = product
            break

    if selected_product is None:
        return {
            "message": "Product not found"
        }

    # --------------------------------------------------------
    # Check duplicate product
    # --------------------------------------------------------

    for product in rooms[request.room_id]["products"]:

        if product["id"] == request.product_id:
            return {
                "message": "Product already added to this room"
            }

    rooms[request.room_id]["products"].append(
        selected_product
    )

    return {
        "message": "Product added to Decision Room",
        "room": rooms[request.room_id]
    }


# ============================================================
# ADD MEMBER
# ============================================================

class AddMemberRequest(BaseModel):
    room_id: str
    member_name: str


@app.post("/rooms/add-member")
def add_member_to_room(request: AddMemberRequest):

    if request.room_id not in rooms:
        return {
            "message": "Room not found"
        }

    room = rooms[request.room_id]

    # --------------------------------------------------------
    # Check duplicate member
    # --------------------------------------------------------

    for member in room["members"]:

        if member["name"].lower() == request.member_name.lower():

            return {
                "message": "Member already exists in this room"
            }

    room["members"].append({
        "name": request.member_name,
        "vote": None
    })

    return {
        "message": "Member added to room",
        "room": room
    }


# ============================================================
# JOIN ROOM
# ============================================================

@app.post("/rooms/join")
def join_room(request: AddMemberRequest):

    if request.room_id not in rooms:
        return {
            "message": "Room not found"
        }

    room = rooms[request.room_id]

    for member in room["members"]:

        if member["name"].lower() == request.member_name.lower():

            return {
                "message": "You are already a member of this room",
                "room": room
            }

    room["members"].append({
        "name": request.member_name,
        "vote": None
    })

    return {
        "message": "Joined Decision Room successfully",
        "room": room
    }


# ============================================================
# VOTE
# ============================================================

class VoteRequest(BaseModel):
    room_id: str
    member_name: str
    product_id: int


@app.post("/rooms/vote")
def vote_for_product(request: VoteRequest):
    if request.room_id not in rooms:
        return {"message": "Room not found"}

    room = rooms[request.room_id]

    # Find the member using case-insensitive matching
    matched_member = None

    for member in room["members"]:
        if (
            member.get("name", "").strip().lower()
            == request.member_name.strip().lower()
        ):
            matched_member = member
            break

    if matched_member is None:
        return {"message": "Member not found in this room"}

    # Find the product in this room
    selected_product = None

    for product in room["products"]:
        if product["id"] == request.product_id:
            selected_product = product
            break

    if selected_product is None:
        return {"message": "Product is not part of this room"}

    # Use the member's original/canonical name
    canonical_member_name = matched_member["name"]

    # Record or replace the member's vote
    room["votes"][canonical_member_name] = request.product_id

    # Update the member's displayed vote
    matched_member["vote"] = request.product_id

    return {
        "message": "Vote recorded successfully",
        "room": room
    }


# ============================================================
# DECISION RESULT
# ============================================================

@app.get("/rooms/{room_id}/result")
def get_room_result(room_id: str):

    if room_id not in rooms:
        return {
            "message": "Room not found"
        }

    room = rooms[room_id]

    if not room["votes"]:
        return {
            "message": "No votes have been cast yet"
        }

    # --------------------------------------------------------
    # Count votes
    # --------------------------------------------------------

    vote_counts = {}

    for product_id in room["votes"].values():

        if product_id not in vote_counts:
            vote_counts[product_id] = 0

        vote_counts[product_id] += 1

    highest_votes = max(
        vote_counts.values()
    )

    # --------------------------------------------------------
    # Find winner IDs
    # --------------------------------------------------------

    winner_ids = [
        product_id
        for product_id, count in vote_counts.items()
        if count == highest_votes
    ]

    # --------------------------------------------------------
    # Vote summary
    # --------------------------------------------------------

    vote_summary = []

    for product in room["products"]:

        count = vote_counts.get(
            product["id"],
            0
        )

        vote_summary.append({
            "product": product,
            "votes": count
        })

    vote_summary.sort(
        key=lambda x: x["votes"],
        reverse=True
    )

    # --------------------------------------------------------
    # TIE
    # --------------------------------------------------------

    if len(winner_ids) > 1:

        tied_products = []

        for product in room["products"]:

            if product["id"] in winner_ids:
                tied_products.append(product)

        return {
            "room_id": room_id,
            "room_name": room["room_name"],
            "status": "tie",
            "winner": None,
            "winner_votes": highest_votes,
            "total_votes": len(room["votes"]),
            "tied_products": tied_products,
            "vote_summary": vote_summary
        }

    # --------------------------------------------------------
    # WINNER
    # --------------------------------------------------------

    winner_id = winner_ids[0]

    winner = None

    for product in room["products"]:

        if product["id"] == winner_id:
            winner = product
            break

    return {
        "room_id": room_id,
        "room_name": room["room_name"],
        "status": "winner",
        "winner": winner,
        "winner_votes": highest_votes,
        "total_votes": len(room["votes"]),
        "tied_products": [],
        "vote_summary": vote_summary
    }