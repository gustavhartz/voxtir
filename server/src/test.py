import requests
import json

# Define the GraphQL query and variables
graphql_query = """
query Query($documentId: ID!) {
  documentJSON(documentId: $documentId)
}
"""
variables = {
    "documentId": "8da35aa2-a415-405e-94a4-6586c773902a"  # Replace with the actual document ID you want to query
}

# Define the API endpoint URL
url = "https://api.staging.voxtir.com/graphql"

# Set the headers including the 'Origin' header for CORS and the Bearer token
headers = {
    "Content-Type": "application/json",
    "Origin": "https://app.staging.voxtir.com",
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjV3ejVMcjJ5d0dJTDRCdTZmLTNUdCJ9.eyJpc3MiOiJodHRwczovL3ZveHRpci1zdGFnaW5nLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2NTAwNTZhOWNmMjY2M2RkZjEzY2U4NjEiLCJhdWQiOlsiaHR0cHM6Ly92b3h0aXItc3RhZ2luZy5ldS5hdXRoMC5jb20vYXBpL3YyLyIsImh0dHBzOi8vdm94dGlyLXN0YWdpbmcuZXUuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTY5NjA4Mzg4MCwiZXhwIjoxNjk2MTcwMjgwLCJhenAiOiJlTGMxNWdNbWg4ZHl0TEVCYkFjbFZOV21ZM3paNWxVZCIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwifQ.oAyDEL2RVen8rakBTAC_FNa_6QnaL6FMJgLVZ3OPINbXN0hQgXdzmm3bNS1hsKGIgRxGA-wVFmub6XG1DXvmcc9vozg-R0j1AwaDOc2FqGvOgYYh9ycbB1vH_6lzENY3ILMVwF93BfuMhNdEHtpymRQEo3POZjoxPPSzy0RxnRt1DEK2effWhybjmIX1_xIPIKnEEW7rfA7EPWEMFKiDUv174O3UO1wxtftFuoiXtQpjCbJwB2Pv_X0i3obDOZwkxVkwBG84PdsCRxYVD0CfK1GnZlP5MC_HE6Vc4Xc-QH9zJgcReQ1If4xYzv3y09ADwHhVlngc03NKcJTZ00l1Zw",  # Replace with your actual Bearer token
}

# Create the request payload
payload = {"query": graphql_query, "variables": variables}

# Send the POST request to the GraphQL API
response = requests.post(url, json=payload, headers=headers)

# Check the response status and content
if response.status_code == 200:
    data = json.loads(response.json()["data"]["documentJSON"])
    with open("document.json", "w") as f:
        json.dump(data, f, indent=2)
    print("GraphQL response data:", data)
else:
    print("GraphQL request failed with status code:", response.status_code)
    print("Response content:", response.text)
