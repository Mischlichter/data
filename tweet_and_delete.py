import tweepy
import os

def create_api():
    auth = tweepy.OAuthHandler(os.getenv('API_KEY'), os.getenv('API_SECRET'))
    auth.set_access_token(os.getenv('ACCESS_TOKEN'), os.getenv('ACCESS_TOKEN_SECRET'))
    api = tweepy.API(auth)
    return api

def tweet_and_delete(api):
    try:
        with open('html_files.txt', 'r') as file:
            html_files = file.readlines()
        
        for html_file in html_files:
            html_file = html_file.strip()
            tweet_text = f"https://www.hogeai.com/sharing/{html_file}"
            tweet = api.update_status(tweet_text)
            print(f"Tweeted: {tweet.id}")
            # Wait for 60 seconds before deleting the tweet
            time.sleep(60)
            api.destroy_status(tweet.id)
            print(f"Deleted Tweet ID: {tweet.id}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    api = create_api()
    tweet_and_delete(api)
