"""API Module."""

import sys
import json
from fastapi import FastAPI, Request
import pandas as pd
import base64
from io import StringIO
import json

# Plotting
import plotly.express as px
from plotly.io import to_html, to_json
import plotly.figure_factory as ff
from starlette.responses import HTMLResponse


app = FastAPI()


@app.get("/api/python")
def python():
    """Demo function printing python version."""
    return {"Python Version": sys.version}


# class CsvFile(BaseModel):
#     file: str


# API endpoint to upload file & analyse
@app.post("/api/analyse", response_class=HTMLResponse)
async def analyse(request: Request):
    """
    Endpoint that accepts any type of request body.

    :param request: FastAPI Request object
    :return: JSON response
    """
    # Access the request body as bytes
    request_body = await request.body()

    result = {}

    # Process the request_body as needed (e.g., parse JSON, decode, etc.)
    try:
        data = json.loads(request_body.decode())

        # Split the data URI to extract the base64-encoded data
        _, base64_data = data["file"].split(",", 1)

        # Decode the base64 data
        decoded_data = base64.b64decode(base64_data)

        # Convert the decoded data to a string
        csv_content = decoded_data.decode("utf-8")

        # Create a file-like object from the CSV content using StringIO
        csv_file = StringIO(csv_content)

        df = pd.read_csv(csv_file)
        print(df.head())

        min = df["Values3"].min()
        max = df["Values3"].max()
        min_range = (min * 1.2) if min < 0 else (min * 0.8)
        max_range = (max * 1.2) if max > 0 else (max * 0.8)

        # PLOTLY FIGURE - DISTPLOT
        dist_plot = ff.create_distplot(
            [df["Values3"].dropna()],
            ["Value"],
            bin_size=(max - min) / 50,
            show_rug=False,
            curve_type="normal",
        )
        dist_plot.update_xaxes(range=[min_range, max_range])
        dist_json = json.loads(to_json(dist_plot, pretty=True))

        result["distplot"] = dist_json

        return json.dumps(result)
    except json.JSONDecodeError as error:
        return {"error": "Invalid JSON data", "data": error.msg}
