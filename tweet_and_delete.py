import tweepy
import time
import os

def create_api():
    # Fetch environment variables and replace underscores with dashes if needed
    consumer_key = os.getenv('TWITTER_API_KEY').replace('_', '-')
    consumer_secret = os.getenv('TWITTER_API_SECRET').replace('_', '-')
    access_token = os.getenv('TWITTER_ACCESS_TOKEN').replace('_', '-')
    access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET').replace('_', '-')
    
    # Authenticate with Twitter using Tweepy
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    
    # Create the API object
    api = tweepy.API(auth)
    return api

def tweet_and_delete(api):
    try:
        # Read the HTML files list
        with open('html_files.txt', 'r') as file:
            html_files = file.readlines()
        
        for html_file in html_files:
            filename = html_file.strip()
            url = f"https://www.hogeai.com/sharing/{filename}"
            tweet_content = f"Check out our new content: {url}"
            
            # Tweet the content
            tweet = api.update_status(tweet_content)
            print(f"Tweeted: {tweet.id}")

            # Wait for 10 seconds before deleting the tweet
            time.sleep(30)

            # Delete the tweet
            api.destroy_status(tweet.id)
            print(f"Deleted tweet: {tweet.id}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    api = create_api()
    tweet_and_delete(api)
