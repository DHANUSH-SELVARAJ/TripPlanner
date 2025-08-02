export async function onRequestGet(context) {
    const { searchParams } = new URL(context.request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
        return new Response(JSON.stringify({ error: "Missing lat or lon" }), { status: 400 });
    }

    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    const res = await fetch(apiUrl, {
        headers: {
            "User-Agent": "TripPlanner/1.0",
            "Accept-Language": "en"
        }
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });
}
