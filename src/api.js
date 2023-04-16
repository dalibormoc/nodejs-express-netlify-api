import express from "express";
import serverless from "serverless-http";
import response from "./data";

const app = express();
const router = express.Router();

//serve the page from dist folder
app.use(express.static("dist"));

// router.get("/", (req, res) => {
//   res.json({
//     name: "Netlify API",
//   });
// });

// Data route
router.get("/:entity", (req, res) => {
  const { entity } = req.params;

  const data = response[entity];

  if (!data) {
    return res.status(404).send("Not found");
  }

  // Get the request query string object
  const query = String(req.query.q || "")
    .trim()
    .toLowerCase();

  // Determine if the property includes the filter string
  const itemContainsFilter = (str) =>
    (str || "").toLowerCase().includes(query) || false;

  let filteredData;

  if (!query) {
    filteredData = data;
  } else {
    // Filter the response data if a filter query string is present
    filteredData = data.filter((responseData) => {
      for (const property in responseData) {
        // Only allow searching when the object property is typeof `string`
        // If string is found, return true
        if (
          responseData[property] &&
          typeof responseData[property] === "string" &&
          itemContainsFilter(responseData[property])
        ) {
          return true;
        }
      }
      return false;
    });
  }
  return res.status(200).send(filteredData);
});

app.use(`/.netlify/functions/api`, router);

const handler = serverless(app);

export { app, handler };
