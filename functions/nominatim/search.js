export async function onRequestGet(context) {
    const { searchParams } = new URL(context.request.url);
    const query = searchParams.get("q");

    if (!query) {
        return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });
    }

    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;

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
