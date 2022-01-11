#!/usr/bin/env python3
import requests, re, os, argparse, html

#RE
dir_start = '<tr><td valign="top"><img src="/icons/folder.gif" alt="[DIR]"></td><td><a href="'
dir_end = '/">'
find_directories = re.compile(re.escape(dir_start)+'(.*)'+re.escape(dir_end))

vid_start = '<tr><td valign="top"><img src="/icons/movie.gif" alt="[VID]"></td><td><a href="'
vid_end = '"'
find_videos = re.compile('(?<='+re.escape(vid_start)+')(.*?)(?='+re.escape(vid_end)+')')

def download_dir(directory):
	directory = html.unescape(directory)

	#Fetch
	print('Fetching {}'.format(directory))
	while 1:
		try:
			dir_rq = requests.get(directory)
			assert (dir_rq.status_code == 200)
		except Exception:
			continue
		break
		
	dir_page = dir_rq.text

	#Save videos
	videos = re.findall(find_videos, dir_page)
	print('Found {} videos!'.format(len(videos)))
	for vid in videos:
		vidUrl = directory+html.unescape(vid)
		name = os.path.splitext(vid)[0]
		id = name[-11:]
		with open(args.out_file, 'a') as fl:
			fl.write("{} {}".format(id, vidUrl))
			fl.write("\n")

	#Recurse into directories
	dirs_to_download = re.findall(find_directories, dir_page)
	print('Found {} directories!'.format(len(dirs_to_download)))
	for dir in dirs_to_download:
		print()
		download_dir(directory+dir+"/") #Recurse

def main():
	global args

	#Args
	parser = argparse.ArgumentParser(description="Generate The Pony Archive video lookup table. Format: VIDEO_ID VIDEO_URL\\nVIDEO_ID VIDEO_URL ...")
	parser.add_argument("--out", "-o", dest="out_file", help="Output file", required=True)
	args = parser.parse_args()

	#Program
	download_dir("https://www.theponyarchive.com/archive/youtube/")
	download_dir("https://www.theponyarchive.com/archive/quickchive/")


if __name__ == "__main__":
	main()
