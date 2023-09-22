from src import main


class Context:
    def __init__(self, arn: str):
        self.invoked_function_arn = arn


print(
    main.lambda_handler(
        {
            "input_file_bucket": "voxtir-audiofiles-staging",
            "input_file_key": "raw-audio/6579c92d-f962-4c29-987c-42f17525396a.mp3",
            "input_file_format": "mp3",
            "output_file_bucket": "voxtir-audiofiles-staging",
            "output_file_key": "raw-audio/test-lambda.mp3",
            "output_file_format": "mp3",
        },
        Context("Sample ARN"),
    )
)
