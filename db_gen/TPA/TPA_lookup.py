import os
from urllib.parse import unquote

class TPA_Lookup():
	lookup_table = {}
	def load(self, file):
		with open(file, "r") as fl:
			lookup_table_raw = fl.read().splitlines()
		for line in lookup_table_raw:
			key = line[:line.find(" ")] #Using find instead of split to only take into consideration the first space in case there are spaces in the url
			value = line[line.find(" ")+1:]
			self.lookup_table[key] = value
	def lookup(self, vid_id):
		return self.lookup_table.get(vid_id)
	def get_id(self, url):
		#Assume the url always ends with youtube id
		return url[-11:]
	def lookup_metadata(self, vid_id):
		archivalUrl = self.lookup(vid_id)
		if(archivalUrl):
			try:
				#ONLY WORKS FOR SOME VIDEOS
				vidFilename = os.path.basename(archivalUrl)
				vidFilename = os.path.splitext(vidFilename)[0]
				vidFilename = vidFilename[::-1] #Parse from the end of the filename
				vidFilename = vidFilename[11:] #Strip id
				vidFilename = vidFilename.split("-")

				channel = archivalUrl.split("/")
				channel_id = channel[-2][::-1][:24][::-1]
				channel = channel[-2][::-1][24+1:][::-1]
				channel = unquote(channel)
				channel = channel.replace("_", " ")

				assert (len(vidFilename)>= 5),"Metadata processing error"

				vidInfo = {}
				vidInfo["id"] = vid_id
				vidInfo["webpage_url"] = "https://youtube.com/watch?v={}".format(vid_id)
				vidInfo["thumbnail"] = os.path.splitext(archivalUrl)[0]+".jpg"
				vidInfo["upload_date"] = vidFilename[3][::-1]
				vidInfo["uploader"] = channel
				vidInfo["uploader_url"] = "https://www.youtube.com/channel/{}".format(channel_id)
				vidInfo["title"] = "-".join(vidFilename[5:])[::-1].replace("_", " ")
				vidInfo["unavailable"] = True
				vidInfo["archived"] = {"TPA": archivalUrl}
				vidInfo["description"] = ""

				return vidInfo
			except AssertionError:
				return None
		else:
			return None
