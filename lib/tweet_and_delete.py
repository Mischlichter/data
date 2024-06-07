import tweepy
import time
import os

def create_client():
    # Initialize the Tweepy Client with OAuth 2.0 Bearer Token
    client = tweepy.Client(
        bearer_token=os.getenv('BEARER_TOKEN'),
        consumer_key=os.getenv('TWITTER_API_KEY'),
        consumer_secret=os.getenv('TWITTER_API_SECRET'),
        access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
        access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
        wait_on_rate_limit=True
    )
    return client

def get_rate_limit_status(headers):
    remaining = int(headers.get('x-rate-limit-remaining', 0))
    reset_time = int(headers.get('x-rate-limit-reset', 0))
    return remaining, reset_time

def tweet_and_delete(client, file_path):
    try:
        with open(file_path, 'r') as file:
            html_files = file.readlines()

        for html_file in html_files:
            html_file = html_file.strip()
            filename = os.path.basename(html_file)
            tweet_url = f"https://www.hogeai.com/sharing/{filename}"  # Construct URL

            try:
                response = client.create_tweet(text=tweet_url)
                headers = response.meta.get('headers', {})
                remaining, reset_time = get_rate_limit_status(headers)
                print(f"Tweet posted: {response.data['id']} - URL: {tweet_url}")

                if remaining == 0:
                    print(f"Rate limit exceeded. Continuing to next file.")
                    continue  # Skip further execution in case of rate limit exception

                time.sleep(60)  # Wait for 60 seconds before deleting the tweet

                client.delete_tweet(response.data['id'])
                print(f"Deleted Tweet ID: {response.data['id']}")

            except tweepy.TooManyRequests as e:
                print(f"Rate limit exceeded. Continuing to next file. Error: {e}")
                continue  # Skip further execution in case of rate limit exception
            except Exception as e:
                print(f"An error occurred while posting the tweet: {e}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    api_client = create_client()
    tweet_and_delete(api_client, 'html_files.txt')  # Ensure the file 'html_files.txt' is in the same directory or provide the correct path
