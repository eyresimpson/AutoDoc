property fileTypes : {{«class PNGf», ".png"}}

on run argv
	--judge whether a quick shot or an exiting image file.
	set imagePath to (item 1 of argv)
    set theType to getType()
	
	if theType is equal to "file" then
		return POSIX path of (the clipboard as «class furl»)
	else if theType is not missing value then
		try
			set myFile to (open for access imagePath with write permission)
			set eof myFile to 0
			write (the clipboard as theType) to myFile
			close access myFile
			return (POSIX path of imagePath)
		on error
			try
				close access myFile
			end try
			return ""
		end try
	else
		return "no image"
	end if
end run

on getType()
	set type to missing value
	repeat with theInfo in (clipboard info)
		set itemType to (first item of theInfo)
		if (itemType as string) is equal to "«class furl»" then
			return "file"
		end if
		repeat with aType in fileTypes
			if itemType is equal to (first item of aType) then
				set type to (first item of aType)
			end if
		end repeat
	end repeat

	return type
end getType