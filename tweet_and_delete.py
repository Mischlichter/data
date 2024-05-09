import tweepy
import time
import os

def create_api():
    consumer_key = os.environ['TWITTER_API_KEY']
    consumer_secret = os.environ['TWITTER_API_SECRET']
    access_token = os.environ['TWITTER_ACCESS_TOKEN']
    access_token_secret = os.environ['TWITTER_ACCESS_TOKEN_SECRET']
    
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
            tweet_content = f"Check out our new content: {url}"
            
            # Tweet the content
            tweet = api.update_status(tweet_content)
            print(f"Tweeted: {tweet.id}")

            # Wait for 10 seconds
            time.sleep(10)

            # Delete the tweet
            api.destroy_status(tweet.id)
            print(f"Deleted tweet: {tweet.id}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    api = create_api()
    tweet_and_delete(api)
