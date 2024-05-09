import tweepy
import os

def create_client():
    # Initialize the Tweepy Client with OAuth 2.0 User Context credentials
    client = tweepy.Client(
        consumer_key=os.getenv('TWITTER_API_KEY'),
        consumer_secret=os.getenv('TWITTER_API_SECRET'),
        access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
        access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
        bearer_token=os.getenv('BEARER_TOKEN'),  # Optional: For methods that can use Bearer Token
        return_type=requests.Response,  # Optional: To handle the response directly
        wait_on_rate_limit=True
    )
    return client

def tweet_and_delete(client, file_path):
    try:
        with open(file_path, 'r') as file:
            html_files = file.readlines()
        
        for html_file in html_files:
            html_file = html_file.strip()
            tweet_text = f"Check out our latest content: https://www.hogeai.com/sharing/{html_file}"
            response = client.create_tweet(text=tweet_text)
            print(f"Tweeted: {response.data['id']} - {tweet_text}")
            
            # Wait for 60 seconds before deleting the tweet
            time.sleep(60)
            
            client.delete_tweet(response.data['id'])
            print(f"Deleted Tweet ID: {response.data['id']}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    client = create_client()
    tweet_and_delete(client, 'html_files.txt')
