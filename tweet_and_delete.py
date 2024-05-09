import tweepy
import time
import os

def authenticate():
    # Create an OAuthHandler instance with your consumer keys and access tokens
    auth = tweepy.OAuthHandler(os.getenv('TWITTER_API_KEY'), os.getenv('TWITTER_API_SECRET'))
    auth.set_access_token(os.getenv('TWITTER_ACCESS_TOKEN'), os.getenv('TWITTER_ACCESS_TOKEN_SECRET'))
    
    # Create a Tweepy API object to interact with the Twitter API
    api = tweepy.API(auth, wait_on_rate_limit=True)
    return api

def tweet_and_delete(api):
    try:
        # Posting a tweet
        tweet = api.update_status("Hello, world!")
        print(f"Tweet posted: {tweet.id}")

        # Waiting for visibility or user interaction
        time.sleep(60)  # 60 seconds wait

        # Deleting the tweet
        api.destroy_status(tweet.id)
        print(f"Tweet deleted: {tweet.id}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    api = authenticate()
    tweet_and_delete(api)
