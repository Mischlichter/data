import tweepy
import time
import os

def create_client():
    # Initialize the Tweepy Client with OAuth 2.0 Bearer Token
    client = tweepy.Client(
        bearer_token=os.getenv('BEARER_TOKEN'),
        consumer_key=os.getenv('TWITTER_API_KEY'),  # These are only needed if user-context actions are necessary
        consumer_secret=os.getenv('TWITTER_API_SECRET'),
        access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
        access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
        wait_on_rate_limit=False  # Disable automatic rate limit waiting
    )
    return client

def tweet_and_delete(client, file_path):
    try:
        with open(file_path, 'r') as file:
            html_files = file.readlines()
        
        for html_file in html_files:
            html_file = html_file.strip()
            filename = os.path.basename(html_file)
            tweet_url = f"https://www.hogeai.com/sharing/{filename}"  # Construct URL
            
            try:
                tweet = client.create_tweet(text=tweet_url)  # Post the tweet
                print(f"Tweet posted: {tweet.data['id']} - URL: {tweet_url}")
                
                time.sleep(11)  # Wait for 1 second before deleting the tweet

                client.delete_tweet(tweet.data['id'])  # Delete the tweet
                print(f"Deleted Tweet ID: {tweet.data['id']}")

            except tweepy.TooManyRequests as e:
                print(f"Rate limit exceeded. Skipping further processing. Error: {e}")
                break  # Skip further processing if rate limit is hit
            except Exception as e:
                print(f"An error occurred while posting the tweet: {e}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    api_client = create_client()
    tweet_and_delete(api_client, 'html_files.txt')  # Ensure the file 'html_files.txt' is in the same directory or provide the correct path
