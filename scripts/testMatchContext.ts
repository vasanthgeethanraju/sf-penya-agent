import { getMatchContext } from "../src/tools/getMatchContext";

async function main() {
  const context = await getMatchContext();

  console.log("MATCH CONTEXT");
  console.log(context);
}

main().catch(console.error);