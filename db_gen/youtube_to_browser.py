#!/usr/bin/env python3
import pony_rewatch
import TPA.TPA_lookup
import argparse
import traceback
import os
import json
import dateutil.parser
import re
import requests

YT_ID_LEN = 11
TPA_Lookup = TPA.TPA_lookup.TPA_Lookup()

def filter_metadata_keys(metadata):
	#Filter out unneeded stuff
	for vid_index in range(len(metadata)):
		filtered_vid = {}
		for to_copy in ["id", "uploader", "upload_date", "thumbnail", "title", "uploader_url", "webpage_url", "unavailable", "reupload", "archived", "tags", "view_count"]:
			filtered_vid[to_copy] = metadata[vid_index].get(to_copy)
		metadata[vid_index] = filtered_vid

	return metadata

def process_args(args):
	#Input dir
	if(not os.path.isdir(args.input_dir)):
		pony_rewatch.log("{} is not a directory!".format(args.input_dir), "error")
		exit()
	#Load TPA lookup table
	if(args.TPA):
		pony_rewatch.log("Loading {} lookup table".format(args.TPA), "status_big")
		if(not os.path.isfile(args.TPA)):
			pony_rewatch.log("{} is not a file!".format(args.TPA), "error")
		TPA_Lookup.load(args.TPA)
	#Blacklists
	pony_rewatch.load_blacklists(args.blacklists)

def load_unavailable(filename):
	#Load list of unavailable videos and make sure that there are no duplicates
	if(not os.path.isfile(filename)):
		pony_rewatch.log("{} is not a file!".format(filename), "error")
		exit()
	with open(filename, "r") as fl:
		file_raw = fl.read()
	output = []
	for line in file_raw.splitlines():
		vid_url = line.split(" ")[1]
		vid_id = vid_url[-YT_ID_LEN:]
		output.append(vid_id)
	output = list(set(output)) #Remove duplicates
	return output

def recover_unavailable(ids):
	#Try to recover videos and their metadata
	#ids is a list of youtube ids
	output = []
	for id in ids:
		TPA = TPA_Lookup.lookup_metadata(id)
		if(TPA):
			output.append(TPA)
	return output

def divide_chunks(l, n):
	# looping till length l
	for i in range(0, len(l), n): 
		yield l[i:i + n]

api_key = "AIzaSyA-dlBUjVQeuc4a6ZN4RkNUYDFddrVLxrA"

def find_unavailable(metadata):
	#Checks which videos are unavailable using the youtube api
	#and sets the video and thumbnail url to the archive url
	id_list = []
	for i in metadata:
		#id_list.append(metadata["id"])
		id_list.append(i["id"])
	for chunk in list(divide_chunks(id_list, 50)):
		response = requests.get((   
			f'https://www.googleapis.com/youtube/v3/videos?'
			f'id={",".join(chunk)}'
			f'&part=snippet,status'
			f'&key={api_key}'
		))
	return metadata
	
def archive_search(metadata):
	for vid_index in range(len(metadata)):
		metadata[vid_index]["archived"] = {}
		TPA = TPA_Lookup.lookup(metadata[vid_index]["id"])
		if(TPA):
			metadata[vid_index]["archived"]["TPA"] = TPA
	return metadata

def find_reuploads(metadata):
	#Find videos that are reuploaded based on keywords and mark them
	#in case the original upload date was given in the description, correct metadata
	for video_index in range(len(metadata)):
		video = metadata[video_index]

		description = video["description"]
		for char in "!@#$%^&*()_+-=[];'\\,./{}:\"|<>?~`\n	": #Replace unnecessary symbols with space
			description = description.replace(char, " ")
		description = " ".join(description.split()) #Multiple spaces to a single space
		description = description.lower() #Matching should be case insensitive, so convert description to lowercase
		for match in re.finditer("originally uploaded in |originally uploaded on |originally uploaded ", description): #After these matches there should be a date when the original was uploaded
			next_three_words = " ".join( description[match.end():].split(" ")[:3] )
			try:
				orig_date = dateutil.parser.parse(next_three_words)
				metadata[video_index]["upload_date"] = orig_date.strftime("%Y%m%d") #Convert to youtube-dl date format
				metadata[video_index]["reupload"] = True
			except dateutil.parser._parser.ParserError:
				pass
	return metadata

def choose_best_thumbnail(metadata):
	#Sometimes maxresdefault is not available
	for vid in metadata:
		best_thumbnail = None
		for thumbnail in vid["thumbnails"][::-1]: #From best to worst
			if thumbnail.get("width"): #Only existing ones
				best_thumbnail = thumbnail["url"]
				break
		if best_thumbnail:
			vid["thumbnail"] = best_thumbnail
	return metadata

def filter_multiple_cameras(metadata):
	#filters out videos with multiple cameras which don't contain most of the needed metadata
	#metadata for individual cameras is downloaded anyways
	out = []
	for vid in metadata:
		if(vid.get("duration") != None):
			out.append(vid)
	return out

def main():
	#Arg parsing
	parser = argparse.ArgumentParser(description="Convert metadata downloaded by Youtube-DL and save it in a format readable by the video browser")
	parser.add_argument("--in", "-i", dest="input_dir", help="This directory is recursively searched for *.info.json files (other files are omitted)", required=True)
	parser.add_argument("--out", "-o", dest="output", help="Output file", required=True)
	parser.add_argument("--tpa", dest="TPA", metavar="TABLE", help="The Pony Archive lookup table", required=False)
	parser.add_argument("--unavailable", dest="unavail_list", metavar="LIST", help="List of unavailable videos", required=False)
	parser.add_argument("--blacklists", dest="blacklists", nargs="+", metavar="FILE", help="Youtube id blacklists", required=False)
	args = parser.parse_args()
	process_args(args)

	#Load metadata
	metadata = pony_rewatch.search_for_extension(args.input_dir, ".info.json")
	metadata = pony_rewatch.load_json_files(metadata)
	metadata = filter_multiple_cameras(metadata)
	metadata = pony_rewatch.filter_dicts_blacklisted(metadata)
	metadata = choose_best_thumbnail(metadata)
	metadata = archive_search(metadata) #Search archives for these videos, shouldn't be run on recovered metadata because they get "archived" key in recover_unavailable() function
	metadata = find_unavailable(metadata) #Find unavailable and set the main url to the archive url

	#Load unavailable metadata
	if(args.unavail_list):
		pony_rewatch.log("Recovering unavailable videos", "status_big")
		unavailable = load_unavailable(args.unavail_list)
		unavailable = pony_rewatch.filter_ids_blacklisted(unavailable)
		recovered = recover_unavailable(unavailable)
		metadata+=recovered
		pony_rewatch.log("Recovered {}/{} videos".format(len(recovered), len(unavailable)), "success")

	#Process metadata. At this point recovered unavailable videos and regular videos are combined
	metadata = find_reuploads(metadata)
	metadata = pony_rewatch.sort_dict_list(metadata, "upload_date") #Needed for per episode sorting
	metadata = filter_metadata_keys(metadata)

	#Save final metadata into a file
	with open(args.output, "w") as fl:
		fl.write("[")
		counter=0
		for i in metadata:
			fl.write(json.dumps(i))
			counter+=1
			if counter!=len(metadata):
				fl.write(",")
			fl.write("\n")
		fl.write("]")

if(__name__ == "__main__"):
	try:
		pony_rewatch.set_echo(0)
		main()
	except (KeyboardInterrupt, SystemExit, GeneratorExit):
		pass
	except:
		pony_rewatch.log("ERROR", "error")
		traceback.print_exc()
	pony_rewatch.set_echo(1)
