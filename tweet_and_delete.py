import tweepy
import os
import time
import logging

logging.basicConfig(level=logging.DEBUG)

def create_api():
    # Fetch credentials directly from environment variables
    consumer_key = os.getenv('TWITTER_API_KEY')
    consumer_secret = os.getenv('TWITTER_API_SECRET')
    access_token = os.getenv('TWITTER_ACCESS_TOKEN')
    access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
    

    
    # Setup Tweepy API authentication
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    
    api = tweepy.API(auth)
    return api

def tweet_and_delete(api):
    try:
        # Read HTML filenames from a text file
        with open('html_files.txt', 'r') as file:
            html_files = file.readlines()
        
        # Tweet each URL and then delete it after 60 seconds
        for html_file in html_files:
            filename = html_file.strip()
            url = f"https://www.hogeai.com/sharing/{filename}"
            tweet_content = f"Check out our latest content: {url}"
            
            # Post a tweet
            tweet = api.update_status(tweet_content)
            print(f"Tweeted: {tweet.id}")

            # Wait for 60 seconds
            time.sleep(60)

            # Delete the tweet
            api.destroy_status(tweet.id)
            print(f"Deleted tweet: {tweet.id}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    api = create_api()
    tweet_and_delete(api)
