from flask import Blueprint, request, jsonify
import requests

recycling_bp = Blueprint("recycling", __name__)

@recycling_bp.route("/nearby-centers", methods=["GET"])
def nearby_centers():
    lat = request.args.get("lat")
    lng = request.args.get("lng")

    if not lat or not lng:
        return jsonify({"error": "Latitude and longitude required"}), 400

    overpass_url = "https://overpass-api.de/api/interpreter"

    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="recycling"](around:10000,{lat},{lng});
      node["amenity"="waste_disposal"](around:10000,{lat},{lng});
      node["recycling_type"="centre"](around:10000,{lat},{lng});
    );
    out body;
    """

    try:
        response = requests.get(overpass_url, params={"data": query})
        data = response.json()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    centers = []

    for element in data.get("elements", []):
        centers.append({
            "name": element.get("tags", {}).get("name", "Recycling Point"),
            "lat": element["lat"],
            "lng": element["lon"],
            "address": element.get("tags", {}).get("addr:street", "Address not available")
        })

    return jsonify(centers)
