# scr_colors v3.0 Made by Ninfia
import struct
from eudplib import *
Address_RECOVER = 0x58F450
Address_VALUE = 1
Address_WAIT		= 0xDB8714
Address_WAIT_FLAG   = 0xDB870C

Size = { # a<=X<b, Valid Range
	"uc" : [[0,12]],
	"mc" : [[0,12]],
	"scc" : [[0,12]],
	"wfp" : [[0,24],[104,116],[156,196]],
	"wfc" : [[0,136]],
	"scp" : [[0,3],[5,7]],
	"tp" : [[0,24]],
	"mp" : [[0,32]],
	"256p" : [[0,256]],
	"df" : [[0,4]],
	"sf" : [[0,4]],
	"scf" : [[0,4]]
}
Addr = {
	"uc" : 0x581D76, # Unit Color / EUD Addr
	"mc" : 0x581DD6, # Minimap Color / EUD Addr
	"scc" : 0x581D6A, # Selection Circle Color / EUD Addr
	"wfp" : 0xDB20B8, # Wireframe Palette
	"wfc" : 0xB308A8, # Wireframe Color
	"scp" : 0xB95F43, # Selection Circle Palette
	"tp" : 0xDCB608, # Text Palette
	"mp" : 0xDCB730, # Misc Palette
	"256p" : 0xBA9068, # 256 Color Palette
	"df" : 0xB3CA58, # Dragbox Color Filter
	"sf" : 0xB3CA68, # Shadow Color Filter
	"scf" : 0xB3CA88 # Screen Color Filter
}
D = { # SetEWait Act for Write Values
	"wfp" : {}, 
	"wfc" : {},
	"scp" : {},
	"tp" : {},
	"mp" : {},
	"256p" : {},
	"df" : {},
	"sf" : {},
	"scf" : {}
}
N = len(D.keys())
Raw = { # Original Data
	"wfp" : [0x87,0x75,0x8A,0xA5,0xA5,0xA2,0xA2,0xA0,0xA0,0x29,0xAE,0x17,0x17,0x62,0xA4,0xA4,0xA3,0xA1,0x9C,0xB1,0x1A,0x00,0x00,0x00],
	"wfc" : [0x0A,0x0A,0x0A,0x0A,0x0A,0x0A,0x0A,0x00,0x0A,0x0A,0x00,0x00,0x0A,0x0A,0x00,0x01,0x0A,0x0A,0x01,0x01,0x0A,0x00,0x01,0x01,0x0A,0x01,0x01,0x01,0x00,0x01,0x01,0x01,0x00,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x0A,0x0A,0x0A,0x0A,0x0A,0x0A,0x0A,0x00,0x0A,0x0A,0x00,0x00,0x0A,0x00,0x00,0x00,0x0A,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x00,0x01,0x01,0x00,0x01,0x01,0x01,0x00,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x02,0x02,0x09,0x02,0x08,0x09,0x07,0x08,0x06,0x07,0x05,0x06,0x04,0x05,0x03,0x04,0x0E,0x06,0x07,0x08,0x13,0x0B,0x0D,0x06,0x13,0x0B,0x0A,0x10,0x01,0x12,0x14,0x10,0x01,0x12,0x14,0x0C,0x00,0x01,0x12,0x0A,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
	"scp" : [0xB8,0xB9,0xB9,0xBA,0xB9,0xBA,0x75,0xBD,0x6A,0x81,0x6D,0xA6,0x6D,0xA7,0x3D,0x3D,0x62,0x62,0x62,0x62,0x64,0xAD,0x17,0x6F,0x00,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x08,0x00,0xA9,0xFE,0x88,0x13,0x00,0x00,0x10,0x27,0x00,0x00,0x70,0xFF,0x1D,0x13,0x01,0x00,0x00,0x00],
	"tp" : [0xC0,0x9B,0x9A,0x95,0x43,0x00,0x00,0x28,0x56,0xA7,0x6D,0x65,0x5C,0x00,0x00,0x8A,0x41,0xFF,0x53,0x97,0x47,0x00,0x00,0x8A,0x40,0x96,0x49,0x90,0x42,0x00,0x00,0x8A,0xA8,0xAE,0x17,0x5E,0xAA,0x00,0x00,0x8A,0xB5,0x75,0xBA,0xB9,0xB7,0x00,0x00,0x8A,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x8A,0x6F,0x17,0x5E,0xAA,0x8A,0x8A,0x8A,0x28,0xA5,0xA2,0x2D,0xA0,0x8A,0x8A,0x8A,0x8A,0x9F,0x9E,0x9D,0xB7,0x8A,0x8A,0x8A,0x8A,0xA4,0xA3,0xA1,0x0E,0x8A,0x8A,0x8A,0x8A,0x9C,0x1C,0x1A,0x13,0x8A,0x8A,0x8A,0x8A,0x13,0x12,0x11,0x57,0x8A,0x8A,0x8A,0x8A,0x54,0x51,0x4E,0x4A,0x8A,0x8A,0x8A,0x8A,0x87,0xA6,0x81,0x93,0x8A,0x8A,0x8A,0xB5,0xB9,0xB8,0xB7,0xB6,0x8A,0x8A,0x8A,0x8A,0x88,0x84,0x81,0x60,0x8A,0x8A,0x8A,0x8A,0x86,0x72,0x70,0x69,0x8A,0x8A,0x8A,0x8A,0x33,0x7C,0x7A,0xA0,0x8A,0x8A,0x8A,0x8A,0x4D,0x26,0x23,0x22,0x8A,0x8A,0x8A,0x8A,0x9A,0x97,0x95,0x91,0x8A,0x8A,0x8A,0x8A,0x88,0x84,0x81,0x60,0x8A,0x8A,0x8A,0x8A,0x80,0x34,0x31,0x2E,0x8A,0x8A,0x8A],
	"mp" : [0xFF,0x54,0x54,0x53,0x51,0x99,0x4E,0x96,0x4A,0x49,0x47,0x90,0xEF,0x42,0x8B,0xCF,0xA5,0x87,0x75,0xB9,0xAE,0x9C,0x7C,0x14,0x99,0x80,0x00,0x00,0x00,0x00,0x00,0x00],
	"256p" : [0x00000000,0x003B2727,0x00472F2F,0x00533B37,0x004B332F,0x00432B2B,0x003B2727,0x00775753,0x006F4F4B,0x00674B47,0x0073534F,0x00835F57,0x00936B63,0x00A3776B,0x003A003A,0x00190019,0x0018242C,0x00142448,0x00142C5C,0x00143070,0x00243C68,0x0018407C,0x002C4C78,0x000808A8,0x0030548C,0x00446084,0x001C54A0,0x00184CC4,0x002468BC,0x003C70B4,0x002064D0,0x003494DC,0x005494E0,0x0054C4EC,0x00284434,0x003C6C40,0x00506C48,0x0050804C,0x005C8C50,0x0078A05C,0x00180000,0x00341000,0x00500800,0x00483424,0x00544030,0x007C3414,0x006C4C34,0x00745840,0x008C6848,0x009C7000,0x00A48058,0x00D46840,0x00B8AC18,0x00FC2424,0x00BC9464,0x00CCA870,0x00D8C08C,0x00F4DC94,0x00E8DCAC,0x00FCFCAC,0x00F8F8CC,0x0000FCFC,0x0090E4F4,0x00C0FCFC,0x000C0C0C,0x00101418,0x00201C1C,0x00302828,0x00243038,0x00443C38,0x0030404C,0x004C4C4C,0x0040505C,0x00585858,0x00686868,0x006C8478,0x006C9468,0x007CA474,0x008C9498,0x0094B890,0x00A8C498,0x00B0B0B0,0x00B0CCAC,0x00BCC0C4,0x00D0E0CC,0x00F0F0F0,0x0008101C,0x000C1828,0x00081034,0x000C2034,0x00201038,0x00202834,0x00083444,0x00183048,0x00000060,0x00202854,0x00144050,0x0014545C,0x00040484,0x00344C68,0x0030387C,0x00206470,0x0050507C,0x001C34A4,0x00006C94,0x00405C98,0x0034808C,0x00547498,0x004454B8,0x001890B0,0x005C74B0,0x000404F4,0x005478C8,0x005468FC,0x0084A4E0,0x006894FC,0x002CCCFC,0x0018FC10,0x0020000C,0x002C1C1C,0x004C2424,0x00682C28,0x0084302C,0x00B81820,0x00AC3C34,0x00946868,0x00FC9064,0x00FCAC7C,0x00FCE400,0x0040909C,0x005494A8,0x005CA4BC,0x0060B8CC,0x0080D8E8,0x00B0C4EC,0x0038FCFC,0x007CFCFC,0x00A4FCFC,0x00080808,0x00101010,0x00181818,0x00282828,0x00343434,0x00383C4C,0x00444444,0x00584848,0x00685858,0x00386874,0x005C6478,0x007C6060,0x00747484,0x009C8484,0x007C8CAC,0x009498AC,0x00B89090,0x00E8B8B8,0x00148CF8,0x003C5410,0x00709020,0x0094B42C,0x00642004,0x00501C48,0x00983408,0x00783068,0x009C4088,0x00CC480C,0x0034B8BC,0x003CDCDC,0x00000010,0x00000024,0x00000034,0x00000048,0x00041860,0x0008288C,0x001818C8,0x002C2CE0,0x002020E8,0x001450E8,0x002020FC,0x002478E8,0x003CACF8,0x00001400,0x00002800,0x00004400,0x00006400,0x00088008,0x00249824,0x003C9C3C,0x0058B058,0x0068B868,0x0080C480,0x0094D494,0x0024140C,0x00643C24,0x00845030,0x00945C38,0x00B47448,0x00C48454,0x00D49460,0x00ECB478,0x00081014,0x000C1418,0x000C2C24,0x00181010,0x00201414,0x00402C2C,0x00684C44,0x00040404,0x0010181C,0x00141C20,0x001C2024,0x001C2830,0x002C3840,0x00384854,0x004C5C68,0x00647C90,0x00142028,0x00142830,0x00182C34,0x001C2C38,0x001C303C,0x00243844,0x00304454,0x0004100C,0x00041814,0x00081C18,0x0008201C,0x000C2420,0x0010342C,0x00103C34,0x00104840,0x00302020,0x003C2828,0x00483430,0x00141414,0x001C1820,0x00182028,0x00241C24,0x00242428,0x002C2C30,0x00342C3C,0x003C383C,0x00303C48,0x00403444,0x00483C50,0x0034505C,0x00FF2323,0x00FF2323,0x002B3B47,0x002F3F4B,0x00334353,0x00674B43,0x006F534B,0x007B5B53,0x0087635B,0x00FFFFFF],
	"df" : [0x3D808081,0x3F7CFCFD,0x3DC0C0C1,0x3F800000],
	"sf" : [0x00000000,0x00000000,0x00000000,0x3F800000],
	"scf" : [0x3F800000,0x3F800000,0x3F800000,0x3F800000]
}
# 2nd = ((1st - Address_WAIT)//4 + Address_WAIT_FLAG)
Rewrite = { # Reset Wait flags before SetEWait (Left→Right Order Exec)
	"tp" : [[0xDB8754,0xDB8838,0xDB8BC4,0xDB99F8,0xDBD2C8],[1,1,2,4,13],0],
	"mp" : [[0xDB8754,0xDB8838,0xDB8BC8,0xDB9A08,0xDBD310],[1,1,1,2,3],0]
}
Recover = { # Reset Wait flags after SetEWait (Left→Right Order Exec)
	"wfc" : [[0xD8FF20,0xD16770],[10,35]],
	"scp" : [[0xD9648C,0xD2FD14],[1,4]],
	"df" : [[0xD90B3C,0xD197DC],[1,2]],
	"sf" : [[0xD90B3C,0xD197E0],[2,2]],
	"scf" : [[0xD90B40,0xD197E8],[1,2]]
}
R = { # SetEWait Act for Recover Values
	"wfc" : {},
	"scp" : {},
	"df" : {},
	"sf" : {},
	"scf" : {}
}
Cond = { # Patch Condition
	"uc" : [0,0],
	"mc" : [0,0],
	"scc" : [0,0],
	"wfp" : [0,0],
	"wfc" : [0,0],
	"scp" : [0,0],
	"tp" : [0,0],
	"mp" : [0,0],
	"256p" : [0,0],
	"df" : [0,0],
	"sf" : [0,0],
	"scf" : [0,0]
}
print("[SC:R Colors v3.0] Current Version : v1.23.10.13515 (25/06/07)")

def float_to_hex(f):
	return hex(struct.unpack('<I', struct.pack('<f', f))[0])

def toNum(s):
	try:
		return int(s)
	except:
		return int(s,16)

def toFloat(s):
	try:
		return float_to_hex(toNum(s)/255)
	except:
		return float_to_hex(float(s))

def isOffset(s):
	if (s.find('_') == -1):
		return False
	else:
		return True

def getOffset(s):
	return int(s[1:],16)

def getRaw(key,epd):
	return (Raw[key][epd*4+3]<<24)+(Raw[key][epd*4+2]<<16)+(Raw[key][epd*4+1]<<8)+Raw[key][epd*4]

def parseOption(t):
	ret = []
	fpos, rpos = 0, 0
	for i, c in enumerate(t):
		if (c == '('):
			fpos = i+1
		elif (c == ')'):
			rpos = i-1
			spos = t.find(',',fpos,rpos)
			ret.append([t[fpos:spos],t[spos+1:rpos+1]])
	return ret

def parseCond(t):
	ret = []
	fpos, rpos = 0, 0
	for i, c in enumerate(t):
		if (c == '('):
			fpos = i+1
		elif (c == ')'):
			rpos = i-1
			spos1 = t.find(',',fpos,rpos)
			spos2 = t.rfind(',',fpos,rpos)
			ret.append([t[fpos:spos1].strip().lower(),t[spos1+1:spos2],t[spos2+1:rpos+1]])
	return ret

mode = 1
EAct = {
	"uc" : [],
	"mc" : [],
	"scc" : []
}
VAct = {
	"uc" : [],
	"mc" : [],
	"scc" : []
}
EActused = 0
lshmask = [0xFFFFFF00,0xFFFF00FF,0xFF00FFFF,0x00FFFFFF]
bitmask = [0x000000FF,0x0000FF00,0x00FF0000,0xFF000000]
for K, V in settings.items():
	if K.lower() == 'mode':
		mode = int(V)
	if K.lower() == 'condition':
		sector = {"unit color":"uc","minimap color":"mc","selection circle color":"scc","wireframe palette":"wfp","wireframe color":"wfc","selection circle palette":"scp","text palette":"tp","misc palette":"mp","256 color palette":"256p","dragbox color filter":"df","shadow color filter":"sf","screen color filter":"scf"}
		t = parseCond(V)
		for k, v in enumerate(t):
			if (sector.get(v[0]) != None):
				key, off, val = sector[v[0]], toNum(v[1]), toNum(v[2])
				Cond[key][0], Cond[key][1] = off, val
	if K.lower() == 'recover':
		t = V.split(",")
		Address_RECOVER, Address_VALUE = toNum(t[0]), toNum(t[1])
	if K.lower() == 'unit color':
		key = "uc"
		t = parseOption(V)
		for k, v in enumerate(t):
			off = toNum(v[0])
			ptr = Addr[key]+8*off
			epd, lsh = EPD(ptr), (ptr)%4
			check = 0
			for loc in Size[key]:
				if (loc[0] <= off and off < loc[1]):
					check = 1
			if (check == 1):
				if (isOffset(v[1]) == True):
					VAct[key].append([epd,EPD(getOffset(v[1])),1<<(lsh*8),bitmask[lsh]])
				else:
					EAct[key].append(SetDeathsX(epd,SetTo,toNum(v[1])<<(lsh*8),0,bitmask[lsh]))
				EActused = 1
	if K.lower() == 'minimap color':
		key = "mc"
		t = parseOption(V)
		for k, v in enumerate(t):
			off = toNum(v[0])
			ptr = Addr[key]+off
			epd, lsh = EPD(ptr), (ptr)%4
			check = 0
			for loc in Size[key]:
				if (loc[0] <= off and off < loc[1]):
					check = 1
			if (check == 1):
				if (isOffset(v[1]) == True):
					VAct[key].append([epd,EPD(getOffset(v[1])),1<<(lsh*8),bitmask[lsh]])
				else:
					EAct[key].append(SetDeathsX(epd,SetTo,toNum(v[1])<<(lsh*8),0,bitmask[lsh]))
				EActused = 1
	if K.lower() == 'selection circle color':
		key = "scc"
		t = parseOption(V)
		for k, v in enumerate(t):
			off = toNum(v[0])
			ptr = Addr[key]+off
			epd, lsh = EPD(ptr), (ptr)%4
			check = 0
			for loc in Size[key]:
				if (loc[0] <= off and off < loc[1]):
					check = 1
			if (check == 1):
				if (isOffset(v[1]) == True):
					VAct[key].append([epd,EPD(getOffset(v[1])),1<<(lsh*8),bitmask[lsh]])
				else:
					EAct[key].append(SetDeathsX(epd,SetTo,toNum(v[1])<<(lsh*8),0,bitmask[lsh]))
				EActused = 1
	if K.lower() == "wireframe palette":
		key = "wfp"
		t = parseOption(V)
		for k, v in enumerate(t):
			off = toNum(v[0])
			epd, lsh = off//4, off%4
			check = 0
			for loc in Size[key]:
				if (loc[0] <= off and off < loc[1]):
					check = 1
			if (check == 1):
				if (isOffset(v[1]) == True):
					D[key][epd] = [v[1], 4]
				else:
					if (D[key].get(epd) == None):
						D[key][epd] = (toNum(v[1]) << (lsh*8)) + ((getRaw(key,epd) if epd < 6 else 0) & lshmask[lsh])
					elif (type(D[key][epd]) is not list):
						D[key][epd] = (toNum(v[1]) << (lsh*8)) + (D[key][epd] & lshmask[lsh])
	if K.lower() == "wireframe color":
		key = "wfc"
		t = parseOption(V)
		for k, v in enumerate(t):
			off = toNum(v[0])
			epd, lsh = off//4, off%4
			check = 0
			for loc in Size[key]:
				if (loc[0] <= off and off < loc[1]):
					check = 1
			if (check == 1):
				if (isOffset(v[1]) == True):
					D[key][epd] = [v[1], 4]
					R[key][epd] = getRaw(key,epd)
				else:
					if (D[key].get(epd) == None):
						D[key][epd] = (toNum(v[1]) << (lsh*8)) + (getRaw(key,epd) & lshmask[lsh])
						R[key][epd] = getRaw(key,epd)
					elif (type(D[key][epd]) is not list):
						D[key][epd] = (toNum(v[1]) << (lsh*8)) + (D[key][epd] & lshmask[lsh])
	if K.lower() == "selection circle palette":
		key = "scp"
		t = parseOption(V)
		for k, v in enumerate(t):
			off = toNum(v[0])
			epd, lsh = (8*off)//4, 3
			check = 0
			for loc in Size[key]:
				if (loc[0] <= off and off < loc[1]):
					check = 1
			if (check == 1):
				if (isOffset(v[1]) == True):
					D[key][epd] = [v[1], 1, 0x01000000, (getRaw(key,epd) & lshmask[lsh])]
					R[key][epd] = getRaw(key,epd)
				else:
					if (D[key].get(epd) == None):
						D[key][epd] = (toNum(v[1]) << (lsh*8)) + (getRaw(key,epd) & lshmask[lsh])
						R[key][epd] = getRaw(key,epd)
					elif (type(D[key][epd]) is not list):
						D[key][epd] = (toNum(v[1]) << (lsh*8)) + (D[key][epd] & lshmask[lsh])
	if K.lower() == "text palette":
		colorcode = {0x02:0x01,0x03:0x09,0x04:0x11,0x05:0x19,0x06:0x21,0x07:0x29,0x08:0x41,0x0E:0x49,0x0F:0x51,0x10:0x59,0x11:0x61,0x15:0x69,0x16:0x71,0x17:0x79,0x18:0x81,0x19:0x89,0x1B:0x91,0x1C:0x99,0x1D:0xA1,0x1E:0xA9,0x1F:0xB9}
		key = "tp"
		t = parseOption(V)
		for k, v in enumerate(t):
			cc = toNum(v[0])
			check = 0
			if (colorcode.get(cc) != None):
				check = 1
			if (check == 1):
				off = colorcode[cc]
				epd, lsh = off//4, off%4
				Rewrite[key][2] = 1
				if (isOffset(v[1]) == True):
					D[key][epd] = [v[1], 1, 0x0100, (getRaw(key,epd) & lshmask[lsh])]
				else:
					if (D[key].get(epd) == None):
						D[key][epd] = (toNum(v[1]) << (lsh*8)) + (getRaw(key,epd) & lshmask[lsh])
					elif (type(D[key][epd]) is not list):
						D[key][epd] = (toNum(v[1]) << (lsh*8)) + (D[key][epd] & lshmask[lsh])
	if K.lower() == "misc palette":
		misccode = {"p0":0x0,"p1":0x1,"p2":0x2,"p3":0x3,"p4":0x4,"p5":0x5,"p6":0x6,"p7":0x7,"p8":0x8,"p9":0x9,"p10":0xA,"p11":0xB,"p12":0xC,"p13":0xD,"p14":0xE,"p15":0xF,"fill":0xF,"line":0x10,"self":0x12,"res":0x19}
		key = "mp"
		t = parseOption(V)
		for k, v in enumerate(t):
			mc = v[0].lower()
			check = 0
			if (misccode.get(mc) != None):
				check = 1
			if (check == 1):
				off = misccode[mc]
				epd, lsh = off//4, off%4
				Rewrite[key][2] = 1
				if (isOffset(v[1]) == True):
					D[key][epd] = [v[1], 4]
				else:
					if (D[key].get(epd) == None):
						D[key][epd] = (toNum(v[1]) << (lsh*8)) + (getRaw(key,epd) & lshmask[lsh])
					elif (type(D[key][epd]) is not list):
						D[key][epd] = (toNum(v[1]) << (lsh*8)) + (D[key][epd] & lshmask[lsh])
	if K.lower() == "256 color palette":
		key = "256p"
		t = parseOption(V)
		for k, v in enumerate(t):	
			off = toNum(v[0])
			epd = off
			check = 0
			for loc in Size[key]:
				if (loc[0] <= off and off < loc[1]):
					check = 1
			if (check == 1):
				if (isOffset(v[1]) == True):
					D[key][epd] = [v[1], 4]
				else:
					D[key][epd] = toNum(v[1])
	if K.lower() == "dragbox color filter":
		key = "df"
		t = parseOption(V)
		for k, v in enumerate(t):
			fc = v[0].lower()
			filtercode = {"r":0x0,"g":0x4,"b":0x8,"a":0xC}
			check = 0
			if (filtercode.get(fc) != None):
				check = 1
			if (check == 1):
				epd = filtercode[fc]//4
				R[key][epd] = Raw[key][epd]
				if (isOffset(v[1]) == True):
					D[key][epd] = [v[1], 4]
				else:
					D[key][epd] = int(toFloat(v[1]),16)
	if K.lower() == "shadow color filter":
		key = "sf"
		t = parseOption(V)
		for k, v in enumerate(t):
			fc = v[0].lower()
			filtercode = {"r":0x0,"g":0x4,"b":0x8,"a":0xC}
			check = 0
			if (filtercode.get(fc) != None):
				check = 1
			if (check == 1):
				epd = filtercode[fc]//4
				R[key][epd] = Raw[key][epd]
				if (isOffset(v[1]) == True):
					D[key][epd] = [v[1], 4]
				else:
					D[key][epd] = int(toFloat(v[1]),16)
	if K.lower() == "screen color filter":
		key = "scf"
		t = parseOption(V)
		for k, v in enumerate(t):
			fc = v[0].lower()
			filtercode = {"r":0x0,"g":0x4,"b":0x8,"a":0xC}
			check = 0
			if (filtercode.get(fc) != None):
				check = 1
			if (check == 1):
				epd = filtercode[fc]//4
				R[key][epd] = Raw[key][epd]
				if (isOffset(v[1]) == True):
					D[key][epd] = [v[1], 4]
				else:
					D[key][epd] = int(toFloat(v[1]),16)
	'''
	if K.lower() == 'path':
		txtfile = open(V, 'rb')
		# txtfile -> settings 설정
		txtfile.close()
	'''

@EUDFunc
def SetEWait(src, val):
	ftrg = Forward()
	VProc(
		v=[src,val],
		actions=[
			SetMemory(ftrg+0x164+0x20, SetTo, 4),
			SetMemory(ftrg+0x948, SetTo, 4), # internal flag
			SetMemoryX(ftrg+0x964, SetTo, 0x0, 0xFF000000),
			src.QueueAssignTo(EPD(ftrg)+(8+320+20)//4),
			val.QueueAssignTo(EPD(ftrg)+(8+320+32+12)//4)
		]
	)
	ftrg << RawTrigger(
		actions=[
			SetMemory(0x6509B0, SetTo, 0),
			Action(0, 0, 0, 0, 0, 0, 0, 4, 0, 4),
		]
	)
	f_setcurpl2cpcache()

MEMSIZE, MEMEPD, Rtotal = 0x600, 0x600//4, 0
total, pcheck = EUDVArray(N)(), EUDVArray(N)()
RCEPD, RWEPD, Rtotal, Qtotal, QCP, QSize, Ridx, Rsize, RCP, RZero, CEPD, WEPD, idx, WCP, WSize, Wtotal, Widx, Nidx, VEPD, WVal, MEPD, SEPD = EUDCreateVariables(22)
Recover_CP, Recover_Wait = Db(MEMSIZE*N), Db(MEMSIZE*N)
Queue_CP, Queue_Size = Db(MEMSIZE), Db(MEMSIZE)

def onPluginStart(): 
	Patch_CP, Patch_Wait, Patch_Variable, Patch_Mask, Patch_Shift = Db(MEMSIZE*N), Db(MEMSIZE*N), Db(MEMSIZE*N), Db(MEMSIZE*N), Db(MEMSIZE*N)
	Rewrite_CP, Rewrite_Size = Db(MEMSIZE), Db(MEMSIZE)
	CEPD << EPD(Patch_CP)
	WEPD << EPD(Patch_Wait)
	VEPD << EPD(Patch_Variable)
	MEPD << EPD(Patch_Mask)
	SEPD << EPD(Patch_Shift)
	RCEPD << EPD(Recover_CP)
	RWEPD << EPD(Recover_Wait)
	QCP << EPD(Queue_CP)
	QSize << EPD(Queue_Size)
	WCP << EPD(Rewrite_CP)
	WSize << EPD(Rewrite_Size)

	if EUDIfNot()((Is64BitWireframe())):
		PAct, i, j, k = [], 0, 0, 0
		for key, v in D.items():
			i = 0
			for epd, val in v.items():
				Cp = (Addr[key]-Address_WAIT)//4+epd
				PAct.append(SetDeaths(CEPD+i+MEMEPD*k,SetTo,Cp,0))
				if (type(val) is list):
					if (len(val) == 4):
						PAct.append(SetDeaths(VEPD+i+MEMEPD*k,SetTo,EPD(getOffset(val[0])),0)) # epd
						PAct.append(SetDeaths(MEPD+i+MEMEPD*k,SetTo,val[1],0)) # mask
						PAct.append(SetDeaths(SEPD+i+MEMEPD*k,SetTo,val[2],0)) # shift
						PAct.append(SetDeaths(WEPD+i+MEMEPD*k,SetTo,val[3],0)) # Base Value
					else:
						PAct.append(SetDeaths(VEPD+i+MEMEPD*k,SetTo,EPD(getOffset(val[0])),0)) # epd
						PAct.append(SetDeaths(MEPD+i+MEMEPD*k,SetTo,val[1],0)) # mask
				else:
					PAct.append(SetDeaths(WEPD+i+MEMEPD*k,SetTo,val,0))
				i += 1
			total[k] = i
			k += 1
		for key, v in Rewrite.items():
			if (v[2] == 1):
				for p, u in enumerate(Rewrite[key][1]):
					Cp = (Rewrite[key][0][p]-Address_WAIT)//4
					PAct.append(SetDeaths(WCP+j,SetTo,Cp,0))
					PAct.append(SetDeaths(WSize+j,SetTo,u,0))
					j += 1
		Wtotal << j
		i, j = 0, 0
		for key, v in R.items():
			if (len(v) > 0):
				for p, u in enumerate(Recover[key][1]):
					Cp = (Recover[key][0][p]-Address_WAIT)//4
					PAct.append(SetDeaths(QCP+j,SetTo,Cp,0))
					PAct.append(SetDeaths(QSize+j,SetTo,u,0))
					j += 1
			for epd, val in v.items():
				Cp = (Addr[key]-Address_WAIT)//4+epd
				PAct.append(SetDeaths(RCEPD+i,SetTo,Cp,0))
				PAct.append(SetDeaths(RWEPD+i,SetTo,val,0))
				i += 1
		Rtotal << i
		Qtotal << j
		DoActions(PAct)
	EUDEndIf()

	if EUDIf()((Wtotal.AtLeast(1))):
		if EUDWhile()((Widx < Wtotal)): 
			idx << 0
			RCP << f_maskread_epd(WCP+Widx,0xFFFFFFFF)
			Rsize << f_maskread_epd(WSize+Widx,0xFFFFFFFF)
			if EUDWhile()((idx < Rsize)): 
				SetEWait(RCP+idx,RZero)
				DoActions([idx.AddNumber(1)])
			EUDEndWhile()
			DoActions([Widx.AddNumber(1)])
		EUDEndWhile()
	EUDEndIf()

def beforeTriggerExec():
	if EActused > 0:
		if mode > 0:
			for key, v in EAct.items():
				if Cond[key][0] == 0:
					if EUDExecuteOnce()():
						for p, u in enumerate(VAct[key]):
							v.append(SetDeathsX(u[0],SetTo,f_maskread_epd(u[1],0xFF)*u[2],0,u[3]))
						DoActions(v)
					EUDEndExecuteOnce()
				else:
					if EUDExecuteOnce()((Memory(Cond[key][0],Exactly,Cond[key][1]))):
						for p, u in enumerate(VAct[key]):
							v.append(SetDeathsX(u[0],SetTo,f_maskread_epd(u[1],0xFF)*u[2],0,u[3]))
						DoActions(v)
					EUDEndExecuteOnce()
		else:
			for key, v in EAct.items():
				if Cond[key][0] == 0:
					if EUDExecuteOnce()((EUDNot(Is64BitWireframe()))):
						for p, u in enumerate(VAct[key]):
							v.append(SetDeathsX(u[0],SetTo,f_maskread_epd(u[1],0xFF)*u[2],0,u[3]))
						DoActions(v)
					EUDEndExecuteOnce()
				else:
					if EUDExecuteOnce()((Memory(Cond[key][0],Exactly,Cond[key][1]),EUDNot(Is64BitWireframe()))):
						for p, u in enumerate(VAct[key]):
							v.append(SetDeathsX(u[0],SetTo,f_maskread_epd(u[1],0xFF)*u[2],0,u[3]))
						DoActions(v)
					EUDEndExecuteOnce()
	Temp = EUDVariable()
	Pass = Forward()
	Nidx << 0
	if EUDWhile()((Nidx < N)):
		k = 0
		for key, v in D.items():
			if (Cond[key][0] != 0 and len(v) > 0):
				EUDJumpIf([Nidx.Exactly(k),EUDNot(Memory(Cond[key][0],Exactly,Cond[key][1]))],Pass)
			k += 1
		if EUDIf()((pcheck[Nidx].Exactly(0),total[Nidx].AtLeast(1))):
			idx << 0
			Temp << Nidx*MEMEPD
			if EUDWhile()((idx < total[Nidx])):
				if EUDIf()((Deaths(MEPD+idx+Temp,AtLeast,1,0))):
					if EUDIf()((Deaths(MEPD+idx+Temp,Exactly,1,0))):
						WVal << f_maskread_epd(f_maskread_epd(VEPD+idx+Temp,0xFFFFFFFF),0xFF)*f_maskread_epd(SEPD+idx+Temp,0xFFFFFFFF)+f_maskread_epd(WEPD+idx+Temp,0xFFFFFFFF)
					if EUDElse()():
						WVal << f_maskread_epd(f_maskread_epd(VEPD+idx+Temp,0xFFFFFFFF),0xFFFFFFFF)
					EUDEndIf()
				if EUDElse()():
					WVal << f_maskread_epd(WEPD+idx+Temp,0xFFFFFFFF)
				EUDEndIf()
				SetEWait(f_maskread_epd(CEPD+idx+Temp,0xFFFFFFFF),WVal)
				DoActions([idx.AddNumber(1)])
			EUDEndWhile()
			pcheck[Nidx] = 1
		EUDEndIf()
		Pass << NextTrigger()
		DoActions([Nidx.AddNumber(1)])
	EUDEndWhile()

def afterTriggerExec():
	Check = EUDCreateVariables(1)
	if EUDIf()((Rtotal.AtLeast(1))):
		if EUDIf()((Check.Exactly(0),Memory(Address_RECOVER,Exactly,Address_VALUE))): 
			if EUDIf()((Qtotal.AtLeast(1))):
				if EUDWhile()((Ridx < Qtotal)): 
					idx << 0
					RCP << f_maskread_epd(QCP+Ridx,0xFFFFFFFF)
					Rsize << f_maskread_epd(QSize+Ridx,0xFFFFFFFF)
					if EUDWhile()((idx < Rsize)): 
						SetEWait(RCP+idx,RZero)
						DoActions([idx.AddNumber(1)])
					EUDEndWhile()
					DoActions([Ridx.AddNumber(1)])
				EUDEndWhile()
			EUDEndIf()

			idx << 0
			if EUDWhile()((idx < Rtotal)): 
				SetEWait(f_maskread_epd(RCEPD+idx,0xFFFFFFFF),f_maskread_epd(RWEPD+idx,0xFFFFFFFF))
				DoActions([idx.AddNumber(1)])
			EUDEndWhile()
			Check << 1
		EUDEndIf()
	EUDEndIf()
