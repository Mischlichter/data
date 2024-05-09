import tweepy
import os
import time
import logging

logging.basicConfig(level=logging.DEBUG)

def create_api():
    consumer_key = os.getenv('TWITTER_API_KEY')
    consumer_secret = os.getenv('TWITTER_API_SECRET')
    access_token = os.getenv('TWITTER_ACCESS_TOKEN')
    access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')



    auth = tweepy.OAuth2BearerHandler(os.getenv('BEARER_TOKEN'))  # Use OAuth 2.0 Bearer Token
    api = tweepy.API(auth)
    return api

def tweet_and_delete(api):
    try:
        with open('html_files.txt', 'r') as file:
            html_files = file.readlines()
        
        for html_file in html_files:
            filename = html_file.strip()
            url = f"https://www.hogeai.com/sharing/{filename}"
            tweet_content = f"Check out our latest content: {url}"

            # Post a tweet using v2 endpoint
            response = api.create_tweet(text=tweet_content)
            tweet_id = response.data['id']
            print(f"Tweeted: {tweet_id}")

            # Wait for 60 seconds
            time.sleep(60)

            # Delete the tweet using v2 endpoint
            api.delete_tweet(tweet_id)
            print(f"Deleted tweet: {tweet_id}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    api = create_api()
    tweet_and_delete(api)
