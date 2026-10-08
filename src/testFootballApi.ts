async function testBarcaApi() {
  const response = await fetch(
    "https://api.fc-barcelona.app/api/next-match"
  );

  if (!response.ok) {
    throw new Error(
      `Barça API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  console.log(JSON.stringify(data, null, 2));
}

testBarcaApi();