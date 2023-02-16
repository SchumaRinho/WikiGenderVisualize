import requests
from bs4 import BeautifulSoup
import random
import re

def CrawlingPage(url, depth):

    gender = ""
    nationality = ""
    birth = ""
    name = ""

    response = requests.get("https://en.wikipedia.org"+url)
    soup = BeautifulSoup(response.text, "html.parser")

    name = soup.find("h1").get_text()

    infobox_labels = soup.find_all("th", class_="infobox-label")

    for label in infobox_labels:

        if label.get_text() == "Date of birth" :
            for child in label.parent.findChildren("td"):
                birth = re.search(r"\d{4}", child.get_text()).group()
        
        elif label.get_text() == "Place of birth" :
            for child in label.parent.findChildren("td"):
                country = child.get_text().split(", ")
                nationality = country[len(country)-1]
            break
                
        elif label.get_text() == "Born" :
            for child in label.parent.findChildren("td"):
                country = re.split(", |\(|-\d",child.get_text())
                nationality = country[len(country)-1]
                if(len(country)>=2):
                    birth = country[1]
                
        elif label.get_text() in ["Origin","Nationality"] :
            for child in label.parent.findChildren("td"):
                nationality = child.get_text()
            break        
                
    if nationality == "":
        return 0

    catlinks = soup.find_all("div", id="mw-normal-catlinks")

    for cat in catlinks:
        txt = cat.get_text().lower()
        if " female " in txt:
            gender = "Femme"
        elif " male " in txt:
            gender = "Homme"

    if(gender == "") :
        abstract = soup.find_all("div", id="mw-content-text")
        for ab in abstract :
            for i in range(2):
                txt = ab.findChildren(lambda tag: tag.name == "p" and not tag.find_parent("table"), class_="")[i].get_text().lower()
                if " she " in txt or " her " in txt:
                    gender = "Femme"
                elif " he " in txt or " his " in txt:
                    gender = "Homme"

    visited_urls.add(url)
    
    if(gender != ""):
        print("-> ",name," - ",gender," -",nationality," - ",birth)
        key = nationality+" "+gender+" "+birth
        if(key in dico):
         dico[key] += 1
        else:
         dico[key] = 0

    possibleWay = []
    if depth > 0:
        links = soup.find_all("a")
        for link in links:
            link_url = link.get("href")
            if link_url is not None \
                and link_url.startswith("/wiki/") \
                and not ":" in link_url \
                and link_url not in visited_urls:
                possibleWay.append(link_url)
                #CrawlingPage(link_url,depth-1)
        while True :
            CrawlingPage(random.choice(possibleWay),depth-1)==0
            

dico = dict()
visited_urls = set()
visited_urls.add("/wiki/Thomas_Pesquet")
visited_urls.add("/wiki/Main_Page")

url = "/wiki/E._Lee_Spence"
CrawlingPage(url,100000)
