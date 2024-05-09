import tweepy
import os

import logging

logging.basicConfig(level=logging.DEBUG)

def create_api():
    consumer_key = os.getenv('TWITTER_API_KEY')
    consumer_secret = os.getenv('TWITTER_API_SECRET')
    access_token = os.getenv('TWITTER_ACCESS_TOKEN').replace('_', '-')
    access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET').replace('_', '-')
    
    logging.debug(f"Consumer Key: {consumer_key}")
    logging.debug(f"Consumer Secret: {consumer_secret}")
    logging.debug(f"Access Token: {access_token}")
    logging.debug(f"Access Token Secret: {access_token_secret}")
    
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    
    api = tweepy.API(auth)
    return api


def tweet_and_delete(api):
    try:
        with open('html_files.txt', 'r') as file:
            html_files = file.readlines()
        
        for html_file in html_files:
            filename = html_file.strip()
            url = f"https://www.hogeai.com/sharing/{filename}"
            tweet_content = f"{url}"
            
            tweet = api.update_status(tweet_content)
            print(f"Tweeted: {tweet.id}")

            # Wait for 10 seconds
            time.sleep(60)

            # Delete the tweet
            api.destroy_status(tweet.id)
            print(f"Deleted tweet: {tweet.id}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    api = create_api()
    tweet_and_delete(api)
