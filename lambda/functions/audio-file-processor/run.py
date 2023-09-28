from src import main


class Context:
    def __init__(self, arn: str):
        self.invoked_function_arn = arn


print(
    main.lambda_handler(
        {
            "input_file_bucket": "voxtir-audiofiles-staging",
            "input_file_key": "raw-audio/f399ef0f-e505-48e6-85be-ed115cb92e96.mp3",
            "input_file_format": "mp3",
            "output_file_bucket": "voxtir-audiofiles-staging",
            "output_file_key": "raw-audio/test-lambda.mp3",
            "output_file_format": "mp3",
        },
        Context("Sample ARN"),
    )
)
