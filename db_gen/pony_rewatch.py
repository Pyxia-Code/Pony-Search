import os
import json

blacklist = []

msg_types = {
	"status_big": "\033[35m[*]\033[0m {}\n",
	"update_status": "\033[F\033[G\033[K\033[35m[*]\033[0m {}\n",
	"success": "\033[32m[✓]\033[0m {}\n\n",
	"info": "\033[34m[?]\033[0m {}\n",
	"warning": "\033[33m[!]\033[0m {}\n",
	"error": "\033[31m[X]\033[0m {}\n",
	"continue": "    {}\n",
}

def log(msg_text, msg_type):
	#Check if msg will fit
	msg_template = msg_types[msg_type]
	#Some japanese characters are for some fucking reason longer than normal letters, so fuck it, just divide max length by 1.4
	msg_max_len = int( (os.get_terminal_size().columns - len(msg_template.format("")))/1.4 )
	if(len(msg_text) > msg_max_len):
		msg_text = "{}...".format(msg_text[:msg_max_len-3])
	#Print msg
	print(msg_template.format(msg_text), end="")

def search_for_extension(search_dir, extension):
	#Return a list of .info.json (recursive)
	result_list = []
	log("Searching for {} files in {}".format(extension, search_dir), "status_big")
	print()
	for root, dirs, files in os.walk(search_dir):
		for file in files:
			if(file.endswith(extension)): #Load file
				result_list.append(root + "/" + file)
				log("[{}] Found {}".format(len(result_list), root + "/" + file), "update_status")

	log("Found {} {} files".format(len(result_list), extension), "success")
	return result_list


def load_json_files(file_list):
	#Returns a list of json.load'ed files
	json_list = []
	log("Loading {} json files".format(len(file_list)), "status_big")
	print()
	for file in file_list:
		with open(file, "r") as fl:
			json_list.append( json.load(fl) )
		log("[{:.2%}] {}/{}".format(len(json_list)/len(file_list), len(json_list), len(file_list)), "update_status")
	log("{} files loaded successfully".format(len(json_list)), "success")
	return json_list

def sort_dict_list(dict_list, sort_key):
	#Sorts a list of dictionaries by sort_key and reutrns it
	#sort_key can be a list
	log("Sorting a list of {} dictionaries by key {}".format(len(dict_list), sort_key), "status_big")
	if type(sort_key) == list:
		dict_list = sorted(dict_list, key=lambda element: [element[val] for val in sort_key])
	else:
		dict_list = sorted(dict_list, key=lambda element: element[sort_key])
	log("Dictionary list sorted successfuly", "success")
	return dict_list

def set_echo(value):
	if(value == 0):
		os.system("stty -echo")
	else:
		os.system("stty echo")

def load_blacklists(blacklists):
	global blacklist
	if blacklists == None:
		return
	#Load blacklists
	for current_list in blacklists:
		log("Loading {}".format(current_list), "status_big")
		if(not os.path.isfile(current_list)):
			log("{} is not a file".format(current_list), "error")
			exit()
		with open(current_list, "r") as fl:
			current_list_lines = fl.read().splitlines()
		for line in current_list_lines:
			if not line:
				continue
			if line[0] == "#":
				continue
			blacklist.append(line[-11:])

def filter_dicts_blacklisted(metadata):
	out = []
	for vid in metadata:
		if(not (vid["id"] in blacklist)):
			out.append(vid)
	return out

def filter_ids_blacklisted(unavailable):
	out = []
	for vid in unavailable:
		if(not (vid in blacklist)):
			out.append(vid)
	return out

