// ==UserScript==
// @name        personnel package data 
// @namespace   DeepRoute
// @include     http://deeproute.com/?js=weekbyweek*
// @include     http://www.deeproute.com/?js=weekbyweek*
// @include     http://deeproute.com/default.asp?js=weekbyweek*
// @include     http://www.deeproute.com/default.asp?js=weekbyweek*
// @version     1.6.1
// @description   a program to parse game logs for the deeproute.com football game
// ==/UserScript==

var teamlist=[];
var abbrlist=[];

var teams=[];
var abbrs=[];
var weeks=[];

var teamID=[], links=[], readcount=0, readtarget=1, detailedPackageStats=[], packageYards=[]; 
var sumPackageStats=[], sumDownStats=[], sumAllPackages =[];
var WRSplitStats=[]; 
var WRPlayerStats=[];
var IDPStats=[];
var rushGainSplits=[]; 
var defPkgSplitStats =[];
var defPkgs=[];
var conversionsStats=[];
var passDistSplitStats=[];
var sackStats=[];

var showOffense = 1;
var showBothTeams = 0;
var runPassSplits = 0; 
var WRTargetSplits = 0; 
var WRProductionSplits = 0; 
var individualWRStats = 0;
var individualDefenderStats = 0;
var defPkgSplits = 0;
var conversions = 0;
var passDistSplits = 0;
var sacks = 0;

var Preseason = 0; 
var RegularSeason = 0; 
var Postseason = 0; 

var shortSplit = 3;
var longSplit = 7;

var withPens = 0;
var isFirstRun = 1;

function getElementsByClassName(classname, par){
	 var a=[];
	 var re = new RegExp('\\b' + classname + '\\b'); 
	 var els = par.getElementsByTagName("*"); // node list of every element under par (document, presumably the scedule page?) 
	 for(var i=0,j=els.length; i<j; i++){ // while i is less than the number of elements under par 
			if(re.test(els[i].className)){ // if an element includes "team_checkbox", push the element into a. 
				 a.push(els[i]);
			}
	 }
	 return a;
};

function isTeam(inteam) { // return 1 if inteam is a team name, 0 otherwise 
	for (var x=0; x<teams.length; x++) {
		if (teams[x] == inteam) {
			return 1;
		}
	}
	return 0;
}

function getTeamIndex(inteam) {
	for (var x=0; x<teams.length; x++) {
		if (teams[x] == inteam) {
			return x;
		}
	}
	return -1;
}

function isAbbr(inabbr) {
	for (var x=0; x<abbrs.length; x++) { 
		if (abbrs[x] == inabbr) { 
			return 1; 
		}
	}
	return 0;
}

function correctAbbr(inabbr, showOffense) {
	var isGiven = isAbbr(inabbr); 
	if (showOffense) {
		return isGiven; 
	} else {
		return !(isGiven); 
	}
}

function isID(inid) {
	for (var x=0; x<teamID.length; x++) 
		if (teamID[x]==inid) return 1;
	return 0;
};

function getDistToGo(inTogo, inEndToGo) {
	var distToGo=0; 
	if (inTogo=="inches") {
		distToGo=0.1; 
	} else if (inTogo=="Foot~") {
		distToGo=0.17; 
	} else if (inTogo=="< 1") {
		distToGo=0.67; 
	} else {
		distToGo=parseInt(inTogo);
		if (distToGo == NaN) {
			return -1; 
		}
	}
	if (inEndToGo=="+") {
		distToGo+=0.25; 
	} else if (inEndToGo=="-") {
		distToGo-=0.25; 
	}
	return distToGo; 
}

function getPkgid(inPkg) {
	var pkgid=-1; 
	if (inPkg=="H F T 1 2" || inPkg=="HFT12") {
		pkgid=0; 
	} else if (inPkg=="H F T t 1" || inPkg=="HFTt1") {
		pkgid=1; 
	} else if (inPkg=="H T t 1 2" || inPkg=="HTt12") {
		pkgid=2; 
	} else if (inPkg=="H F 1 2 3" || inPkg=="HF123") {
		pkgid=3; 
	} else if (inPkg=="H T 1 2 3" || inPkg=="HT123") {
		pkgid=4; 
	} else if (inPkg=="H 1 2 3 4" || inPkg=="H1234") {
		pkgid=5; 
	} else if (inPkg=="T 1 2 3 4" || inPkg=="T1234") {
		pkgid=6; 
	} else if (inPkg=="1 2 3 4 5" || inPkg=="12345") {
		pkgid=7; 
	}
	return pkgid; 
}

function getDefPkgid(inPkg) {
    var pkgid = -1;
    if (inPkg=="4-3-4") {
        pkgid=0; 
    } else if (inPkg=="4-2-5") {
        pkgid=1;
    } else if (inPkg=="4-1-6") {
        pkgid=2;
    } else if (inPkg=="4-0-7") {
        pkgid=3;
    } else if (inPkg=="4-4-3") {
        pkgid=4;
    } else if (inPkg=="3-4-4") {
        pkgid=5;
    } else if (inPkg=="3-3-5") {
        pkgid=6;
    } else if (inPkg=="3-2-6") {
        pkgid=7;
    } else if (inPkg=="3-1-7") {
        pkgid=8;
    } else if (inPkg=="3-0-8") {
        pkgid=9;
    } else if (inPkg=="3-5-3") {
        pkgid=10;
    } else if (inPkg=="5-2-4") {
        pkgid=11;
    } else if (inPkg=="5-3-3") {
        pkgid=12;
    } else if (inPkg=="5-4-2") {
        pkgid=13;
    } else if (inPkg=="6-1-4") {
        pkgid=14;
    } else if (inPkg=="6-2-3") {
        pkgid=15;
    } else if (inPkg=="6-3-2") {
        pkgid=16;
    } else if (inPkg=="7-2-2") {
        pkgid=17;
    } else if (inPkg=="7-3-1") {
        pkgid=18;
    }
    return pkgid;
}

function fillDefPkgs() {
    defPkgs[0] = "4-3-4";
    defPkgs[1] = "4-2-5";
    defPkgs[2] = "4-1-6";
    defPkgs[3] = "4-0-7";
    defPkgs[4] = "4-4-3";
    defPkgs[5] = "3-4-4";
    defPkgs[6] = "3-3-5";
    defPkgs[7] = "3-2-6";
    defPkgs[8] = "3-1-7";
    defPkgs[9] = "3-0-8";
    defPkgs[10] = "3-5-3";
    defPkgs[11] = "5-2-4";
    defPkgs[12] = "5-3-3";
    defPkgs[13] = "5-4-2";
    defPkgs[14] = "6-1-4";
    defPkgs[15] = "6-2-3";
    defPkgs[16] = "6-3-2";
    defPkgs[17] = "7-2-2";
    defPkgs[18] = "7-3-1";
}

function getWRID(WR) {
	if (WR == "WR1") {
		return 0; 
	}
	if (WR == "WR2") {
		return 1; 
	}
	if (WR == "WR3") {
		return 2; 
	}
	if (WR == "WR4") {
		return 3; 
	}
	if (WR == "WR5") {
		return 4; 
	}
	if (WR == "TE1") {
		return 5; 
	}
	if (WR == "TE2") {
		return 6; 
	}
	if (WR == "HB " || WR == "HB") {
		return 7; 
	}
	if (WR == "FB " || WR == "FB") {
		return 8; 
	}
	else {
		return -1; 
	}
}

// NOTE: Function incomplete
function getDefID(def) {
	var id = -1;
    if (def == "C1 <") {
    	id = 0;
    }
    else if (def == "C2 <") {
    	id = 1;
    }
    return id;
}

function checkWRList(id, name, position) {
	var index = -1;
    var pos = position.substring(0, 2);
    for (var x=0; x<WRPlayerStats.length; x++) {
    	if (WRPlayerStats[x][0] == id) {
        	index = x;
        	if (WRPlayerStats[index][11].indexOf(pos) == -1) {
        		WRPlayerStats[index][11] = WRPlayerStats[index][11] + "/" + pos;
        	}
            //alert("found reciever " + name + " on the reciever list");
        }
    }
    if (index == -1) {
    	var stats = new Array(14) // player ID, name, 1st opt passes, targets, yards, successes, GCOVs, INTs, Drops, dump passes, dist downfield, position, catches, PDEF
        for (var i=0; i<14; i++) {
        	stats[i] = 0;
        }
        index = WRPlayerStats.length;
        WRPlayerStats[index] = stats;
        WRPlayerStats[index][0] = id;
        WRPlayerStats[index][1] = name;
        WRPlayerStats[index][11] = pos;
        //alert("adding " + name + " to the reciever list");
    }
    return index;
}

function checkIDPList(id, name) {
	var index = -1;
    for (var x=0; x<IDPStats.length; x++) {
    	if (IDPStats[x][0] == id) {
        	index = x;
            //alert("found reciever " + name + " on the reciever list");
        }
    }
    if (index == -1) {
    	var stats = new Array(20) // player ID, name, 1st opt passes, targets, yards, successes, GCOVs, cv INTs, Drops, dump passes, dist downfield, position (MT), catches, cv PDEF, cv TKL, rm INT, rm PDEF, rm TKL, run TKL, run STOP
        for (var i=0; i<20; i++) {
        	stats[i] = 0;
        }
        index = IDPStats.length;
        IDPStats[index] = stats;
        IDPStats[index][0] = id;
        IDPStats[index][1] = name;
        //alert("adding " + name + " to the reciever list");
    }
    return index;
}

function checkRunPass(run, pass, pkgid, downDistID, yards, isSuccess) {
		detailedPackageStats[downDistID][pkgid][pass][0]++; 
		detailedPackageStats[downDistID][pkgid][pass][1]+=yards; 
		detailedPackageStats[downDistID][pkgid][pass][2]+=isSuccess; 
		return; 
} // */

function getSuccess(yards, distToGo, down, isTouchdown) {
	var isSuccess=-1; 
	if (isTouchdown==1) {
		return 1; 
	}
	if (down=="1st") {
		if (yards >= (distToGo*0.45)) {
			return 1;  
		} else {
			return 0; 
		}
	} else if (down=="2nd") {
		if (yards >= (distToGo*0.6)) {
			return 1; 
		} else {
			return 0; 
		}
	} else if (down=="3rd" || down=="4th") {
		if (yards >= distToGo) {
			return 1; 
		} else {
			return 0; 
		}
	}
	return isSuccess; 
}

function getYRD(downDistID, pkgid, isPassPlay) {
	return (detailedPackageStats[downDistID][pkgid][isPassPlay][1]).toFixed(2); 
}

function getYPA(downDistID, pkgid, isPassPlay) {
	var YPA=0; 
	if (detailedPackageStats[downDistID][pkgid][isPassPlay][0]>0) {
		YPA=(detailedPackageStats[downDistID][pkgid][isPassPlay][1]/detailedPackageStats[downDistID][pkgid][isPassPlay][0]).toFixed(1); 
	}
	return YPA; 
}

function getSuccessRate(downDistID, pkgid, isPassPlay) {
	var successRate=0; 
	if (detailedPackageStats[downDistID][pkgid][isPassPlay][0]>0) {
		successRate=(detailedPackageStats[downDistID][pkgid][isPassPlay][2]/detailedPackageStats[downDistID][pkgid][isPassPlay][0])*100; 
	}
	return successRate.toFixed(0); 
}

function make_old_r_p_table(SR_def, YPP_def, OPP_def, ORP_def) {
	var label="<th colspan='3'> Runs </th> <th colspan='3'> Passes </th>"; 
	var stat_defs="<td>" + ORP_def + "</td> <td>" + YPP_def + "</td> <td>" + SR_def + "</td> <td>" + OPP_def + "</td> <td>" + YPP_def + "</td> <td>" + SR_def + "</td>"; 
	var table = 
			"<table border='1'> <tr>" + 
			"<th rowspan='3'> Down and Distance </th> <th colspan='6'> HFT12 </th> <th colspan='6'> HFTt1 </th> <th colspan='6'> HTt12 </th> <th colspan='6'> HF123 </th> <th colspan='6'> HT123 </th> <th colspan='6'> H1234 </th> <th colspan='6'> T1234 </th> <th colspan='6'> 12345 </th> <th colspan='6'> All </th> <tr> " + 
			label + label + label + label + label + label + label + label + label + "<tr>" +  
			stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + "<tr>" + 
			addtr("1st down", 0) + 
			addtr("2nd and 0-" + shortSplit, 1) + 
			addtr("2nd and " + shortSplit + "-" + longSplit, 2) +
			addtr("2nd and " + longSplit + "+", 3) + 
			addtr("3rd/4th and 0-" + shortSplit, 4) +
			addtr("3rd/4th and " + shortSplit + "-" + longSplit, 5) + 
			addtr("3rd/4th and " + longSplit + "+", 6) +
			addSumTr("all") + 
			"</table>";
	return table; 
}

function makePlaytypeTableSection(pkgid, downDistID, isPassPlay) { 
	var tableSection=
		"<td>" + detailedPackageStats[downDistID][pkgid][isPassPlay][0] + 
		"</td> <td>" + getYPA(downDistID, pkgid, isPassPlay) + 
		"</td> <td>" + getSuccessRate(downDistID, pkgid, isPassPlay) + "%" + 
		"</td> ";
	return tableSection; 
}

function makeDDPTableSection(pkgid, downDistID) { 
	var tableSection=
		makePlaytypeTableSection(pkgid, downDistID, 0) + 
		makePlaytypeTableSection(pkgid, downDistID, 1); 
	return tableSection; 
}

function addtr(downDist, downDistID) { 
	var tr="<tr> <th> " + downDist + 
		": </th>" + 
		makeDDPTableSection(0, downDistID) + 
		makeDDPTableSection(1, downDistID) + 
		makeDDPTableSection(2, downDistID) + 
		makeDDPTableSection(3, downDistID) + 
		makeDDPTableSection(4, downDistID) + 
		makeDDPTableSection(5, downDistID) + 
		makeDDPTableSection(6, downDistID) + 
		makeDDPTableSection(7, downDistID) + 
		makeDDTableSection(downDistID); 
	return tr; 
}

function getPkgYRD(pkgid, isPassPlay) {
	return (sumPackageStats[pkgid][isPassPlay][1]).toFixed(2); 
}

function getPkgYPA(pkgid, isPassPlay) {
	var YPA=0; 
	if (sumPackageStats[pkgid][isPassPlay][0]>0) {
		YPA=(sumPackageStats[pkgid][isPassPlay][1]/sumPackageStats[pkgid][isPassPlay][0]).toFixed(1); 
	}
	return YPA; 
}

function getPkgSuccessRate(pkgid, isPassPlay) {
	var successRate=0; 
	if (sumPackageStats[pkgid][isPassPlay][0]>0) {
		successRate=(sumPackageStats[pkgid][isPassPlay][2]/sumPackageStats[pkgid][isPassPlay][0])*100; 
	}
	return successRate.toFixed(0); 
}

function makePkgPlaytypeTableSection(pkgid, isPassPlay) {
	var tableSection=
		"<td>" + sumPackageStats[pkgid][isPassPlay][0] + 
		"</td> <td>" + getPkgYPA(pkgid, isPassPlay) + 
		"</td> <td>" + getPkgSuccessRate(pkgid, isPassPlay) + "%" + 
		"</td>";
	return tableSection; 
}

function makePkgTableSection(pkgid) {
	var tableSection=
		makePkgPlaytypeTableSection(pkgid, 0) + 
		makePkgPlaytypeTableSection(pkgid, 1); 
	return tableSection; 
}

function addSumTr(downDist) {
	var tr="<tr> <th> " + downDist + 
		": </th>" + 
		makePkgTableSection(0) + 
		makePkgTableSection(1) + 
		makePkgTableSection(2) + 
		makePkgTableSection(3) + 
		makePkgTableSection(4) + 
		makePkgTableSection(5) + 
		makePkgTableSection(6) + 
		makePkgTableSection(7) + 
		" </td>"; 
	return tr; 
}

function getDD_YRD(downDistID, isPassPlay) {
	return (sumDownStats[downDistID][isPassPlay][1]).toFixed(2); 
}

function getDD_YPA(downDistID, isPassPlay) {
	var YPA=0; 
	if (sumDownStats[downDistID][isPassPlay][0]>0) {
		YPA=(sumDownStats[downDistID][isPassPlay][1]/sumDownStats[downDistID][isPassPlay][0]).toFixed(1); 
	}
	return YPA; 
}

function getDD_SuccessRate(downDistID, isPassPlay) {
	var successRate=0; 
	if (sumDownStats[downDistID][isPassPlay][0]>0) {
		successRate=(sumDownStats[downDistID][isPassPlay][2]/sumDownStats[downDistID][isPassPlay][0])*100; 
	}
	return successRate.toFixed(0); 
}

function makeDDPlaytypeTableSection(downDistID, isPassPlay) {
	var tableSection=
		"<td>" + sumDownStats[downDistID][isPassPlay][0] + 
		"</td> <td>" + getDD_YPA(downDistID, isPassPlay) +  
		"</td> <td>" + getDD_SuccessRate(downDistID, isPassPlay) + "%" + 
		"</td>";
	return tableSection; 
}

function makeDDTableSection(downDistID) {
	var tableSection=
		makeDDPlaytypeTableSection(downDistID, 0) + 
		makeDDPlaytypeTableSection(downDistID, 1); 
	return tableSection; 
}

function make_WR_target_table(FIRST_def, TGT_def, DMP_def, DIST_def) {
	var stat_defs = "<td>" + FIRST_def + "</td> <td>" + TGT_def + "</td> <td>" + DIST_def + "</td> <td>" + DMP_def + "</td>"; 
	var table = 
		"<table border='2'> <tr>" + 
		"<th rowspan='2'>Package</th> <th rowspan='2'>WR</th> <th colspan='4'>1st Down</th> <th colspan='4'>2nd and 0-"+shortSplit+"</th> <th colspan='4'>2nd and "+shortSplit+"-"+longSplit+"</th> <th colspan='4'>2nd and "+longSplit+"+</th> <th colspan='4'>3rd/4th and 0-"+shortSplit+"</th> <th colspan='4'>3rd/4th and "+shortSplit+"-"+longSplit+"</th> <th colspan='4'>3rd/4th and "+longSplit+"+</th>" + 
		"<tr>" + stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + 
		addWrTgtPkgTr("HFT12", "WR1", "WR2", "TE1", "HB", "FB") + 
		addWrTgtPkgTr("HFTt1", "WR1", "TE1", "TE2", "HB", "FB") + 
		addWrTgtPkgTr("HTt12", "WR1", "WR2", "TE1", "TE2", "HB") + 
		addWrTgtPkgTr("HF123", "WR1", "WR2", "WR3", "HB", "FB") + 
		addWrTgtPkgTr("HT123", "WR1", "WR2", "WR3", "TE1", "HB") + 
		addWrTgtPkgTr("H1234", "WR1", "WR2", "WR3", "WR4", "HB") + 
		addWrTgtPkgTr("T1234", "WR1", "WR2", "WR3", "WR4", "TE1") + 
		addWrTgtPkgTr("12345", "WR1", "WR2", "WR3", "WR4", "WR5") + // */
		"</table>"; 
	return table; 
}

function addWrTgtPkgTr(pkg, wr1, wr2, wr3, wr4, wr5) {
	pkgid = getPkgid(pkg); 
	var row = 
		"<tr> <th rowspan='5'>" + pkg + "</th> <th>" + wr1 + "</th> <td>" 
		+ getFirst(wr1, pkgid, 0) + "</td> <td>" + getTGTs(wr1, pkgid, 0) + "</td> <td>" + getAveDist(wr1, pkgid, 0) + "</td> <td>" + getDumpoffs(wr1, pkgid, 0) + "</td> <td>"
		+ getFirst(wr1, pkgid, 1) + "</td> <td>" + getTGTs(wr1, pkgid, 1) + "</td> <td>" + getAveDist(wr1, pkgid, 1) + "</td> <td>" + getDumpoffs(wr1, pkgid, 1) + "</td> <td>" 
		+ getFirst(wr1, pkgid, 2) + "</td> <td>" + getTGTs(wr1, pkgid, 2) + "</td> <td>" + getAveDist(wr1, pkgid, 2) + "</td> <td>" + getDumpoffs(wr1, pkgid, 2) + "</td> <td>" 
		+ getFirst(wr1, pkgid, 3) + "</td> <td>" + getTGTs(wr1, pkgid, 3) + "</td> <td>" + getAveDist(wr1, pkgid, 3) + "</td> <td>" + getDumpoffs(wr1, pkgid, 3) + "</td> <td>" 
		+ getFirst(wr1, pkgid, 4) + "</td> <td>" + getTGTs(wr1, pkgid, 4) + "</td> <td>" + getAveDist(wr1, pkgid, 4) + "</td> <td>" + getDumpoffs(wr1, pkgid, 4) + "</td> <td>" 
		+ getFirst(wr1, pkgid, 5) + "</td> <td>" + getTGTs(wr1, pkgid, 5) + "</td> <td>" + getAveDist(wr1, pkgid, 5) + "</td> <td>" + getDumpoffs(wr1, pkgid, 5) + "</td> <td>" 
		+ getFirst(wr1, pkgid, 6) + "</td> <td>" + getTGTs(wr1, pkgid, 6) + "</td> <td>" + getAveDist(wr1, pkgid, 6) + "</td> <td>" + getDumpoffs(wr1, pkgid, 6) + "</td>" 
		+ addWrTgtTr(pkgid, wr2) + addWrTgtTr(pkgid, wr3) + addWrTgtTr(pkgid, wr4) + addWrTgtTr(pkgid, wr5); // */
	return row; 
}

function addWrTgtTr(pkgid, wr) {
	var row = "<tr> <th>" + wr + "</th> <td>" + getFirst(wr, pkgid, 0) + "</td> <td>" + getTGTs(wr, pkgid, 0) + "</td> <td>" + getAveDist(wr, pkgid, 0) + "</td> <td>" + getDumpoffs(wr, pkgid, 0) + "</td>" + 
		"<td>" + getFirst(wr, pkgid, 1) + "</td> <td>" + getTGTs(wr, pkgid, 1) + "</td> <td>" + getAveDist(wr, pkgid, 1) + "</td> <td>" + getDumpoffs(wr, pkgid, 1) + "</td>" + 
		"<td>" + getFirst(wr, pkgid, 2) + "</td> <td>" + getTGTs(wr, pkgid, 2) + "</td> <td>" + getAveDist(wr, pkgid, 2) + "</td> <td>" + getDumpoffs(wr, pkgid, 2) + "</td>" + 
		"<td>" + getFirst(wr, pkgid, 3) + "</td> <td>" + getTGTs(wr, pkgid, 3) + "</td> <td>" + getAveDist(wr, pkgid, 3) + "</td> <td>" + getDumpoffs(wr, pkgid, 3) + "</td>" + 
		"<td>" + getFirst(wr, pkgid, 4) + "</td> <td>" + getTGTs(wr, pkgid, 4) + "</td> <td>" + getAveDist(wr, pkgid, 4) + "</td> <td>" + getDumpoffs(wr, pkgid, 4) + "</td>" + 
		"<td>" + getFirst(wr, pkgid, 5) + "</td> <td>" + getTGTs(wr, pkgid, 5) + "</td> <td>" + getAveDist(wr, pkgid, 5) + "</td> <td>" + getDumpoffs(wr, pkgid, 5) + "</td>" + 
		"<td>" + getFirst(wr, pkgid, 6) + "</td> <td>" + getTGTs(wr, pkgid, 6) + "</td> <td>" + getAveDist(wr, pkgid, 6) + "</td> <td>" + getDumpoffs(wr, pkgid, 6) + "</td>"; // */
	return row; 
}

function make_WR_production_table(GCOVpct_def, SR_def, YPT_def, INTpct_def) {
	var stat_defs = "<td>" + GCOVpct_def + "</td> <td>" + SR_def + "</td> <td>" + YPT_def + "</td> <td>" + INTpct_def + "</td>"; 
	var table = 
		"<table border='2'> <tr>" + 
		"<th rowspan='2'>Package</th> <th rowspan='2'>WR</th> <th colspan='4'>1st Down</th> <th colspan='4'>2nd and 0-"+shortSplit+"</th> <th colspan='4'>2nd and "+shortSplit+"-"+longSplit+"</th> <th colspan='4'>2nd and "+longSplit+"+</th> <th colspan='4'>3rd/4th and 0-"+shortSplit+"</th> <th colspan='4'>3rd/4th and "+shortSplit+"-"+longSplit+"</th> <th colspan='4'>3rd/4th and "+longSplit+"+</th>" + 
		"<tr>" + stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + stat_defs + 
		addWrProdPkgTr("HFT12", "WR1", "WR2", "TE1", "HB", "FB") + 
		addWrProdPkgTr("HFTt1", "WR1", "TE1", "TE2", "HB", "FB") + 
		addWrProdPkgTr("HTt12", "WR1", "WR2", "TE1", "TE2", "HB") + 
		addWrProdPkgTr("HF123", "WR1", "WR2", "WR3", "HB", "FB") + 
		addWrProdPkgTr("HT123", "WR1", "WR2", "WR3", "TE1", "HB") + 
		addWrProdPkgTr("H1234", "WR1", "WR2", "WR3", "WR4", "HB") + 
		addWrProdPkgTr("T1234", "WR1", "WR2", "WR3", "WR4", "TE1") + 
		addWrProdPkgTr("12345", "WR1", "WR2", "WR3", "WR4", "WR5") + // */
		"</table>"; 
	return table;
}

function addWrProdPkgTr(pkg, wr1, wr2, wr3, wr4, wr5) {
	pkgid = getPkgid(pkg); 
	var row = 
		"<tr> <th rowspan='5'>" + pkg + "</th> <th>" + wr1 + "</th> <td>" 
		+ getGCOVpct(wr1, pkgid, 0) + "</td> <td>" + getWrSR(wr1, pkgid, 0) + "</td> <td>" + getYPT(wr1, pkgid, 0) + "</td> <td>" + getINTpct(wr1, pkgid, 0) + "</td> <td>"
		+ getGCOVpct(wr1, pkgid, 1) + "</td> <td>" + getWrSR(wr1, pkgid, 1) + "</td> <td>" + getYPT(wr1, pkgid, 1) + "</td> <td>" + getINTpct(wr1, pkgid, 1) + "</td> <td>" 
		+ getGCOVpct(wr1, pkgid, 2) + "</td> <td>" + getWrSR(wr1, pkgid, 2) + "</td> <td>" + getYPT(wr1, pkgid, 2) + "</td> <td>" + getINTpct(wr1, pkgid, 2) + "</td> <td>" 
		+ getGCOVpct(wr1, pkgid, 3) + "</td> <td>" + getWrSR(wr1, pkgid, 3) + "</td> <td>" + getYPT(wr1, pkgid, 3) + "</td> <td>" + getINTpct(wr1, pkgid, 3) + "</td> <td>" 
		+ getGCOVpct(wr1, pkgid, 4) + "</td> <td>" + getWrSR(wr1, pkgid, 4) + "</td> <td>" + getYPT(wr1, pkgid, 4) + "</td> <td>" + getINTpct(wr1, pkgid, 4) + "</td> <td>" 
		+ getGCOVpct(wr1, pkgid, 5) + "</td> <td>" + getWrSR(wr1, pkgid, 5) + "</td> <td>" + getYPT(wr1, pkgid, 5) + "</td> <td>" + getINTpct(wr1, pkgid, 5) + "</td> <td>" 
		+ getGCOVpct(wr1, pkgid, 6) + "</td> <td>" + getWrSR(wr1, pkgid, 6) + "</td> <td>" + getYPT(wr1, pkgid, 6) + "</td> <td>" + getINTpct(wr1, pkgid, 6) + "</td>"  
		+ addWrProdTr(pkgid, wr2) + addWrProdTr(pkgid, wr3) + addWrProdTr(pkgid, wr4) + addWrProdTr(pkgid, wr5); // */
	return row; 
}

function addWrProdTr(pkgid, wr) {
	var row = "<tr> <th>" + wr + "</th> <td>" + getGCOVpct(wr, pkgid, 0) + "</td> <td>" + getWrSR(wr, pkgid, 0) + "</td> <td>" + getYPT(wr, pkgid, 0) + "</td> <td>" + getINTpct(wr, pkgid, 0) + "</td>" + 
		"<td>" + getGCOVpct(wr, pkgid, 1) + "</td> <td>" + getWrSR(wr, pkgid, 1) + "</td> <td>" + getYPT(wr, pkgid, 1) + "</td> <td>" + getINTpct(wr, pkgid, 1) + "</td>" + 
		"<td>" + getGCOVpct(wr, pkgid, 2) + "</td> <td>" + getWrSR(wr, pkgid, 2) + "</td> <td>" + getYPT(wr, pkgid, 2) + "</td> <td>" + getINTpct(wr, pkgid, 2) + "</td>" + 
		"<td>" + getGCOVpct(wr, pkgid, 3) + "</td> <td>" + getWrSR(wr, pkgid, 3) + "</td> <td>" + getYPT(wr, pkgid, 3) + "</td> <td>" + getINTpct(wr, pkgid, 3) + "</td>" + 
		"<td>" + getGCOVpct(wr, pkgid, 4) + "</td> <td>" + getWrSR(wr, pkgid, 4) + "</td> <td>" + getYPT(wr, pkgid, 4) + "</td> <td>" + getINTpct(wr, pkgid, 4) + "</td>" + 
		"<td>" + getGCOVpct(wr, pkgid, 5) + "</td> <td>" + getWrSR(wr, pkgid, 5) + "</td> <td>" + getYPT(wr, pkgid, 5) + "</td> <td>" + getINTpct(wr, pkgid, 5) + "</td>" + 
		"<td>" + getGCOVpct(wr, pkgid, 6) + "</td> <td>" + getWrSR(wr, pkgid, 6) + "</td> <td>" + getYPT(wr, pkgid, 6) + "</td> <td>" + getINTpct(wr, pkgid, 6) + "</td>"; // */
	return row; 
}

function makeDefPkgSplitsTable() {
    var table = "<table border='1'><th>Package</th><th>Total Plays</th><th>Run Plays</th><th>Pass Plays</th>";
    var sumTot = 0;
    var sumPass = 0;
    var sumRun = 0;
    for (var i=0; i<19; i++) {
        table = table.concat("<tr><td> " + defPkgs[i] + " </td> <td> " + defPkgSplitStats[i][0] + " </td><td> " + defPkgSplitStats[i][1] + " </td><td> " + defPkgSplitStats[i][2] + " </td>");
        
        sumTot += defPkgSplitStats[i][0];
        sumRun += defPkgSplitStats[i][1];
        sumPass += defPkgSplitStats[i][2];
    }
    table = table.concat("<tr><td> All </td> <td> " + sumTot + "</td><td>" + sumRun + "</td><td>" + sumPass + "</td> </table>");
    return table;
}

// player ID, name, 1st opt passes, targets, yards, successes, GCOVs, INTs, Drops, dump passes, dist downfield, POS, catches, PDEF
function makeIndividualWRStatTable() {
	var SR_def="<span title='Success Rate: Percentage of plays in which this reciever was targeted which are considered successful (meaning the offense is better off after them than they were before). A successful play is defined here as one which gains 45% of the required yardage on 1st down, 60% on 2nd down, and 100% on 3rd or 4th down. Definition paraphrased from footballoutsiders.com'>SR</span>"; 
	var FIRST_def="<span title='First Option Checks: The number of plays in which this reciever was the QBs first read. This inclues both GCOVs and passing targets (no dumpoffs)'>1st Opt</span>"; 
	var TGT_def="<span title='Targets: The number of passes thrown to this reciever.'>TGT</span>";
	var CMP_def="<span title='Completions: the number of completed passes thrown to this reciever.'>COMP</span>";
	var DMP_def="<span title='Dumpoff Targets: The number of dumpoff passes thrown to this reciever.'>Dumpoffs</span>"; 
	var DIST_def="<span title='Average Depth of Target: the average distance downfield of all passes thrown to this reciever, exluding dumpoffs and drops.'>ADoT</span>"; 
	var YPT_def="<span title='Yards per Target: The average number of yards gained on passes to this reciever'>Y/T</span>";
	var GCOV_def="<span title='Good Coverages: the number of times this reciever was the QBs first read but was not thrown to'>GCOV</span>";
	var GCOVpct_def="<span title='Good Coverage Percentage: the percentage of first option looks to this reciever which result in a GCOV instead of a pass attempt'>GCOV%</span>";
	var INT_def="<span title='Interceptions: the number of interceptions on passes thrown to this reciever'>INT</span>";
	var INTpct_def="<span title='Interception Rate: the percentage of passes thrown to this reciever which result in an interception by the defense'>INT%</span>";
	var PDEF_def="<span title='Pass Deflections: the number of passes thrown to this reciever which were knocked down by a defender. This does not include interceptions'>PDEF</span>";
	var PDEFpct_def="<span title='Pass Deflection Percentage: the percentage of passes thrown to this reciever which were knocked down by a defender'>PDEF%</span>";
	var SC_def="<span title='Success Count: the number of plays in which this player was targeted which were a net positive for the offense'>SC</span>";

	var table = "<table border='1' cellpadding='5'><th>Name</th><th>POS</th><th>" + FIRST_def + "</th><th>" + TGT_def + "</th><th>" + CMP_def + "</th><th>COMP%</th><th>Yards</th><th>" + 
		YPT_def + "</th>" + "<th>" + SC_def + "</th><th>" + SR_def + "</th><th>" + GCOV_def + "</th><th>" + GCOVpct_def + "</th><th>" + INT_def + "</th><th>" + INTpct_def + 
		"</th><th>" + PDEF_def + "</th><th>" + PDEFpct_def + "</th><th>" + DMP_def + "</th><th>" + DIST_def + "</th>";
    for (var i=0; i<WRPlayerStats.length; i++) {
    	table = table.concat("<tr><td>" + WRPlayerStats[i][1] + 
        	"</td><td>" + WRPlayerStats[i][11] + 
        	"</td><td>" + (WRPlayerStats[i][2] + WRPlayerStats[i][6]) + 
        	"</td><td>" + WRPlayerStats[i][3] + 
            "</td><td>" + WRPlayerStats[i][12] + 
            "</td><td>" + calculatePercent(WRPlayerStats[i][12], WRPlayerStats[i][3]) + "%" + 
            "</td><td>" + WRPlayerStats[i][4].toFixed(1) + 
            "</td><td>" + calculateAverage(WRPlayerStats[i][4], WRPlayerStats[i][3]) + 
            "</td><td>" + WRPlayerStats[i][5] + 
            "</td><td>" + calculatePercent(WRPlayerStats[i][5], WRPlayerStats[i][3]) + "%" + 
            "</td><td>" + WRPlayerStats[i][6] + 
            "</td><td>" + calculatePercent(WRPlayerStats[i][6], WRPlayerStats[i][2] + WRPlayerStats[i][6]) + "%" + 
            "</td><td>" + WRPlayerStats[i][7] + 
            "</td><td>" + calculatePercent(WRPlayerStats[i][7], WRPlayerStats[i][3]) + "%" + 
            "</td><td>" + WRPlayerStats[i][13] + 
            "</td><td>" + calculatePercent(WRPlayerStats[i][13], WRPlayerStats[i][3]) + "%" + 
            "</td><td>" + WRPlayerStats[i][9] + 
            "</td><td>" + calculateAverage(WRPlayerStats[i][10], WRPlayerStats[i][3] - WRPlayerStats[i][8] - WRPlayerStats[i][9]) + 
            "</td>");
    }
    table = table.concat("</table>");
    return table;
}

// player ID, name, 1st opt passes, targets, yards, successes, GCOVs, cv INTs, Drops, dump passes, dist downfield, position (MT), catches, cv PDEF, cv TKL, rm INT, rm PDEF, rm TKL, run TKL, run STOP
function makeIDPStatTable() {
	var SR_def="<span title='Success Rate: Percentage of plays in which this player was targeted which are considered successful (meaning the offense is better off after them than they were before). A successful play is defined here as one which gains 45% of the required yardage on 1st down, 60% on 2nd down, and 100% on 3rd or 4th down. Definition paraphrased from footballoutsiders.com'>SR</span>"; 
	var FIRST_def="<span title='First Option Checks: The number of plays in which this player was in coverage against the QBs first read. This inclues both GCOVs and passing targets (no dumpoffs)'>1st Opt</span>"; 
	var TGT_def="<span title='Targets: The number of passes thrown to this player in coverage.'>TGT</span>";
	var CMP_def="<span title='Completions: the number of completed passes thrown to the reciever this player was covering.'>COMP</span>";
	var DMP_def="<span title='Dumpoff Targets: The number of dumpoff passes thrown to the reciever this player was covering.'>Dumpoffs</span>"; 
	var DIST_def="<span title='Average Depth of Target: the average distance downfield of all passes thrown to the reciever this player was covering, exluding dumpoffs and drops.'>ADoT</span>"; 
	var YRD_def="<span title='Yards: The number of yards gained on passes to the reciever this player was covering'>Yards</span>";
	var YPT_def="<span title='Yards per Target: The average number of yards gained on passes to the reciever this player was covering'>Y/T</span>";
	var GCOV_def="<span title='Good Coverages: the number of times this player prevented the QB from throwing to their first read'>GCOV</span>";
	var GCOVpct_def="<span title='Good Coverage Percentage: the percentage of first option looks to the reciever this player was covering which result in a GCOV instead of a pass attempt'>GCOV%</span>";
	var cvINT_def="<span title='Coverage Interceptions: the number of passes thrown to the reciever this player was covering which were intercepted by this player'>covINT</span>";
	var INTpct_def="<span title='Interception Rate: the percentage of passes to the reciever this player was covering which were intercepted by this player'>INT%</span>";
	var cvPDEF_def="<span title='Coverage Pass Deflections: the number of passes thrown to the reciever this player was covering which were knocked down by this player. This does not include interceptions'>covPDEF</span>";
	var PDEFpct_def="<span title='Pass Deflection Percentage: the percentage of passes to the reciever this player was covering which they were able to knock down'>PDEF%</span>";
	var SC_def="<span title='Success Count: the number of plays in which this player was targeted which were a net positive for the offense'>SC</span>";
	var cvTKL_def="<span title='Coverage Tackles: the number of times this player tackled the reciever they were covering'>covTKL</span>";
	var runTKL_def="<span title='Run Play Tackles: tackles made by this player on run plays, including designed runs and scrambles'>runTKL</span>";
	var runSTP_def="<span title='Run Play Stops: tackles made by this player on run plays which were unsuccessful for the offense'>runSTP</span>";
	var rmINT_def="<span title='Roamer Interceptions: the number of passes thrown to recievers this player was NOT covering which were intercepted by this player'>rmINT</span>";
	var rmPDEF_def="<span title='Roamer Pass Deflections: the number of passes thrown to recievers this player was NOT covering which were knocked down by this player. This does not include interceptions'>rmPDEF</span>";
	var rmTKL_def="<span title='Roamer Tackles: the number of times this player tackled a reciever they were NOT covering'>rmTKL</span>";

	var table = "<table border='1' cellpadding='5'><th>Name</th><th>" + FIRST_def + "</th><th>" + TGT_def + "</th><th>" + CMP_def + "</th><th>COMP%</th><th>" + YRD_def + "</th><th>" + 
		YPT_def + "</th>" + "<th>" + SC_def + "</th><th>" + SR_def + "</th><th>" + GCOV_def + "</th><th>" + GCOVpct_def + "</th><th>" + cvINT_def + "</th><th>" + INTpct_def + 
		"</th><th>" + cvPDEF_def + "</th><th>" + PDEFpct_def + "</th><th>" + cvTKL_def + "</th><th>" + DMP_def + "</th><th>" + DIST_def + "</th><th>" + rmINT_def + "</th><th>" + 
		rmPDEF_def + "</th><th>" + rmTKL_def + "</th><th>" + runTKL_def + "</th><th>" + runSTP_def + "</th>";
    for (var i=0; i<IDPStats.length; i++) {
    	table = table.concat("<tr><td>" + IDPStats[i][1] + 
        	"</td><td>" + (IDPStats[i][2] + IDPStats[i][6]) + 
        	"</td><td>" + IDPStats[i][3] + 
            "</td><td>" + IDPStats[i][12] + 
            "</td><td>" + calculatePercent(IDPStats[i][12], IDPStats[i][3]) + "%" + 
            "</td><td>" + IDPStats[i][4].toFixed(1) + 
            "</td><td>" + calculateAverage(IDPStats[i][4], IDPStats[i][3]) + 
            "</td><td>" + IDPStats[i][5] + 
            "</td><td>" + calculatePercent(IDPStats[i][5], IDPStats[i][3]) + "%" + 
            "</td><td>" + IDPStats[i][6] + 
            "</td><td>" + calculatePercent(IDPStats[i][6], IDPStats[i][2] + IDPStats[i][6]) + "%" + 
            "</td><td>" + IDPStats[i][7] + 
            "</td><td>" + calculatePercent(IDPStats[i][7], IDPStats[i][3]) + "%" + 
            "</td><td>" + IDPStats[i][13] + 
            "</td><td>" + calculatePercent(IDPStats[i][13], IDPStats[i][3]) + "%" + 
            "</td><td>" + IDPStats[i][14] + 
            "</td><td>" + IDPStats[i][9] + 
            "</td><td>" + calculateAverage(IDPStats[i][10], IDPStats[i][3] - IDPStats[i][8] - IDPStats[i][9]) + 
            "</td><td>" + IDPStats[i][15] + 
            "</td><td>" + IDPStats[i][16] + 
            "</td><td>" + IDPStats[i][17] + 
            "</td><td>" + IDPStats[i][18] + 
            "</td><td>" + IDPStats[i][19] + 
            "</td>"); 
    }
    table = table.concat("</table>");
    return table;
}

function makePassDistSplitTable() {
	var table = "<table border='1'><th>Pass Distance</th><th>ATT</th><th>COMP</th><th>COMP%</th><th>Yards</th><th>Y/A</th>" + 
    	"<th>Successes</th><th>SR</th><th>INT</th><th>INT%</th><th>ANYA</th><th>ave Pass Dist</th><th>aveYAC</th><th>ave dist to go</th>";
    for (var i=0; i<18; i++) {
    	table = table.concat("<tr><td>" + getPassDistRowHeader(i) + "</td><td>" + passDistSplitStats[i][0] + 
        	"</td><td>" + passDistSplitStats[i][1] + 
        	"</td><td>" + calculatePercent(passDistSplitStats[i][1], passDistSplitStats[i][0]) + "%" + 
        	"</td><td>" + passDistSplitStats[i][3].toFixed(1) + 
        	"</td><td>" + calculateAverage(passDistSplitStats[i][3], passDistSplitStats[i][0]) + 
        	"</td><td>" + passDistSplitStats[i][2] + 
        	"</td><td>" + calculatePercent(passDistSplitStats[i][2], passDistSplitStats[i][0]) + "%" + 
            "</td><td>" + passDistSplitStats[i][7] + 
        	"</td><td>" + calculatePercent(passDistSplitStats[i][7], passDistSplitStats[i][0]) + "%" + 
            "</td><td>" + calculateAverage(passDistSplitStats[i][3] + (20 * passDistSplitStats[i][8]) - (45 * passDistSplitStats[i][7]), passDistSplitStats[i][0]) + 
            "</td><td>" + calculateAverage(passDistSplitStats[i][4], passDistSplitStats[i][0]) + 
        	"</td><td>" + calculateAverage(passDistSplitStats[i][5], passDistSplitStats[i][1]) + 
        	"</td><td>" + calculateAverage(passDistSplitStats[i][6], passDistSplitStats[i][0]) + 
        	"</td>");
    }
    table = table.concat("</table>");
    return table;
}

function getPassDistRowHeader(i) {
	var header = "";
	if (i == 0) {
    	header = "Dumpoff";
    }
    else if (i == 1) {
    	header = "Behind LOS";
    }
    else if (i == 2) {
    	header = "0-1 yards";
    }
    else if (i == 3) {
    	header = "1-2 yards";
    }
    else if (i == 4) {
    	header = "2-3 yards";
    }
    else if (i == 5) {
    	header = "3-4 yards";
    }
    else if (i == 6) {
    	header = "4-5 yards";
    }
    else if (i == 7) {
    	header = "5-6 yards";
    }
    else if (i == 8) {
    	header = "6-7 yards";
    }
    else if (i == 9) {
    	header = "7-8 yards";
    }
    else if (i == 10) {
    	header = "8-9 yards";
    }
    else if (i == 11) {
    	header = "9-10 yards";
    }
    else if (i == 12) {
    	header = "10-12 yards";
    }
    else if (i == 13) {
    	header = "12-14 yards";
    }
    else if (i == 14) {
    	header = "14-16 yards";
    }
    else if (i == 15) {
    	header = "16-18 yards";
    }
    else if (i == 16) {
    	header = "18-20 yards";
    }
    else {
    	header = "20+ yards";
    }
    return header;
}

function calculatePercent(numerator, denominator) {
	var result = 0;
    if (denominator != 0) {
    	result = numerator / denominator;
    }
    return (result*100).toFixed(1);
}

function calculateAverage(numerator, denominator) {
	var result = 0;
    if (denominator != 0) {
    	result = numerator / denominator;
    }
    return result.toFixed(1);
}

function makeConversionTable() {
    var table = "<table border='1' cellpadding='10'><th>Distance</th><th>ATT</th><th>FD</th><th>Pct</th><th>Y/FD</th><th>Y/Stp</th>";
    for (var i=0; i<10; i++) {
        table = table.concat(makeConversionTr(i, i+1, i));
    }
    for (var j=0; j<6; j++) {
        table = table.concat(makeConversionTr(2*j+10, 2*j+12, j+10));
    }
    table = table.concat("</table>");
    return table;
}

function makeConversionTr(min, max, i) {
    var tr = "<tr><th>" + min + " - " + max + " </th><td> " + conversionStats[i][0] + "</td><td>" + conversionStats[i][1] + "</td><td>" + getConversionPct(i) + "% </td><td>" + getYrdPerFD(i) + "</td><td>" + getYrdPerStp(i) + "</td>";
    return tr;
}

function getConversionPct(i) {
    var pct;
    if (conversionStats[i][0] == 0) {
        pct = "-"; 
    }
    else {
        pct = ((conversionStats[i][1]/conversionStats[i][0])*100).toFixed(1);
    }
    return pct;
} // */

function getYrdPerFD(i) {
    var YPF;
    if (conversionStats[i][1] == 0) {
        YPF = "-";
    }
    else {
        YPF = (conversionStats[i][2]/conversionStats[i][1]).toFixed(1);
    }
    return YPF;
}

function getYrdPerStp(i) {
    var YPS;
    var stops = conversionStats[i][0] - conversionStats[i][1];
    if (stops == 0) {
        YPS = "-";
    }
    else {
        YPS = (conversionStats[i][3]/stops).toFixed(1);
    }
    return YPS;
}

function getFirst(wr, pkgid, downDistID) {
	wrid = getWRID(wr); 
	if (wrid == -1) {
		alert("wrid = -1, WR = " + wr); 
	}
	return (WRSplitStats[pkgid][downDistID][wrid][0] + WRSplitStats[pkgid][downDistID][wrid][1]); 
}

function getTGTs(wr, pkgid, downDistID) {
	wrid = getWRID(wr); 
	return (WRSplitStats[pkgid][downDistID][wrid][5] - WRSplitStats[pkgid][downDistID][wrid][2]); 
}

function getDumpoffs(wr, pkgid, downDistID) {
	wrid = getWRID(wr); 
	return WRSplitStats[pkgid][downDistID][wrid][2]; 
}

function getAveDist(wr, pkgid, downDistID) { 
	wrid = getWRID(wr); 
	var dist = WRSplitStats[pkgid][downDistID][wrid][4]; 
	var atts = WRSplitStats[pkgid][downDistID][wrid][5] - (WRSplitStats[pkgid][downDistID][wrid][2] + WRSplitStats[pkgid][downDistID][wrid][3]);
	if (dist==0) {
		return 0; 
	}
	else {
		return (dist/atts).toFixed(1); 
	}
}

function getWrSR(wr, pkgid, downDistID) {
	wrid = getWRID(wr); 
	var SR; 
	if (WRSplitStats[pkgid][downDistID][wrid][5] == 0) {
		SR = 0; 
	}
	else {
		SR = (100*WRSplitStats[pkgid][downDistID][wrid][7]/WRSplitStats[pkgid][downDistID][wrid][5]).toFixed(0);  
	}
	return "<span title='" + WRSplitStats[pkgid][downDistID][wrid][7] + " successful plays in " + WRSplitStats[pkgid][downDistID][wrid][5] + " targets'>" + SR + "</span>%"; 
}

function getYPT(wr, pkgid, downDistID) {
	wrid = getWRID(wr); 
	var YPT; 
	if (WRSplitStats[pkgid][downDistID][wrid][5] == 0) {
		YPT = 0; 
	}
	else {
		YPT = (WRSplitStats[pkgid][downDistID][wrid][6]/WRSplitStats[pkgid][downDistID][wrid][5]).toFixed(1); 
	}
	return "<span title='" + (WRSplitStats[pkgid][downDistID][wrid][6]).toFixed(1) + " recieving yards in " + WRSplitStats[pkgid][downDistID][wrid][5] + " targets'>" + YPT + "</span>"; 
} 

function getGCOVpct(wr, pkgid, downDistID) {
	wrid = getWRID(wr); 
	var firstOpt = WRSplitStats[pkgid][downDistID][wrid][0] + WRSplitStats[pkgid][downDistID][wrid][1]; 
	var GCOVpct; 
	if (firstOpt == 0) {
		GCOVpct = 0; 
	}
	else {
		GCOVpct = (100 * WRSplitStats[pkgid][downDistID][wrid][0] / firstOpt).toFixed(0); 
	}
	return "<span title='" + WRSplitStats[pkgid][downDistID][wrid][0] + " GCOVs in " + firstOpt + " first option checks'>" + GCOVpct + "</span>%"; 
}

function getINTpct(wr, pkgid, downDistID) {
	wrid = getWRID(wr); 
	var INTpct; 
	if (WRSplitStats[pkgid][downDistID][wrid][5] == 0) {
		INTpct = 0; 
	}
	else {
		INTpct = (100 * WRSplitStats[pkgid][downDistID][wrid][8]/WRSplitStats[pkgid][downDistID][wrid][5]).toFixed(1); 
	} // */
	return "<span title='" + WRSplitStats[pkgid][downDistID][wrid][8] + " Interceptions in " + WRSplitStats[pkgid][downDistID][wrid][5] + " target(s)'>" + INTpct + "</span>%"; 
}

function get3rd4thDownDistID(dist) {
    var id = -1;
    if (dist >= 0 && dist <= 1) {
        id=0;
    } else if (dist <= 2) {
        id=1;
    } else if (dist <= 3) {
        id=2;
    } else if (dist <= 4) {
        id=3;
    } else if (dist <= 5) {
        id=4;
    } else if (dist <= 6) {
        id=5;
    } else if (dist <= 7) {
        id=6;
    } else if (dist <= 8) {
        id=7;
    } else if (dist <= 9) {
        id=8;
    } else if (dist <= 10) {
        id=9;
    } else if (dist <= 12) {
        id=10;
    } else if (dist <= 14) {
        id=11;
    } else if (dist <= 16) {
        id=12;
    } else if (dist <= 18) {
        id=13;
    } else if (dist <= 20) {
        id=14;
    } else {
        id=15;
    }
    return id;
}

function getPassDistID(dist) {
	var id = -1;
    if (dist < 0) {
        id=1;
    } else if (dist <= 1) {
        id=2;
    } else if (dist <= 2) {
        id=3;
    } else if (dist <= 3) {
        id=4;
    } else if (dist <= 4) {
        id=5;
    } else if (dist <= 5) {
        id=6;
    } else if (dist <= 6) {
        id=7;
    } else if (dist <= 7) {
        id=8;
    } else if (dist <= 8) {
        id=9;
    } else if (dist <= 9) {
        id=10;
    } else if (dist <= 10) {
        id=11;
    } else if (dist <= 12) {
        id=12;
    } else if (dist <= 14) {
        id=13;
    } else if (dist <= 16) {
        id=14;
    } else if (dist <= 18) {
        id=15;
    } else if (dist <= 20) {
        id=16;
    } else {
        id=17;
    }
    return id;
} // */

function makeTableLable(name) {
	var lable = '<span style="background-color:white"> ' + name + ' </span>';
    return lable;
}

function parsePBP(intext) {
	var ptr1=0, ptr2, ptr3, ptr4, ptr5, ptr6, ptr7, ptr8, ptr9;
    var pkg, defpkg, form, play, abbr, yard, yard2, comp, scramble, INT, incomplete, loss, isTouchdown, isSuccess; 
	var down, togo, distToGo=0, endToGo, gameTime, penalty, noPlay, tmp=0, endptr, dumpoff, first_read, preptr=0; 
	var pkgid, defpkgid, formid, playid, downDistID, index, run, handoff, sneak, pass, att, tmparr, sack, GCOV;
    var pressScram, coverScram, throwAway, pdef, tkl;
    var WR, WRID, WRpID, WRName, GCOVd, GCOVdpID, GCOVdID, GCOVdName, GCOVer, GCOVerID, GCOVerName, passDefenderpID, passDefenderName;
    var defPlaymaker, defPlaymakerpID, defPlaymakerName;
	var startNext, startThis=0, attYard, attYard2, drop, hadYards, tempYardCounter=0;
	var attempts=0, scrambles=0, sacks=0; 
	var name1, name2, abbr1, abbr2, defAbbr, name1Index, name2Index;
	var bothTeamsValid;

	readcount++;
	newDiv = document.getElementById('scout_count');
	newDiv.innerHTML= '<span style="background-color:white">' + readcount.toString() + ' of ' + readtarget + ' games</span>';

	// plan: scan for two team names at the top of the log, get team abbrs for each and set them as abbr1, abbr2. 
	// on each play, check abbr against one of them, if abbr1 isEqual set defAbbr to abbr2, vice versa. 
	
    //alert("started to read the log");
    
    if (preptr==0) {
		ptr2=intext.indexOf("<center>", preptr);
		if (ptr2!=-1) {
			preptr = ptr2; 
		}
	}

	if (abbrs.length > 1) {
		ptr2=intext.indexOf(" wins the flip and will receive.", preptr);
		if (ptr2!=-1) {
			// get recieving team name (team1)
			ptr3=intext.lastIndexOf("<b>", ptr2);
			if (ptr3!=-1) {
				ptr4=intext.indexOf("</b>", ptr3+3);
				if (ptr4!=-1) {
					name1 = intext.substring(ptr3+3, ptr4);
				}
			}
			// get kicking team name (team2)
			ptr3=intext.indexOf("<b>", ptr2);
			if (ptr3!=-1) {
				ptr4=intext.indexOf("</b>", ptr3+3);
				if (ptr4!=-1) {
					name2 = intext.substring(ptr3+3, ptr4);
				}
			}

			name1Index = getTeamIndex(name1);
			name2Index = getTeamIndex(name2);

			if (name1Index != -1 && name2Index != -1) {
				bothTeamsValid = 1;
				abbr1 = abbrs[name1Index];
				abbr2 = abbrs[name2Index];
				//alert(name1 + " at " + name1Index + ", " + name2 + " at " + name2Index);
			}
			else {
				bothTeamsValid = 0; 
				//alert("invalid names: " + name1 + " at " + name1Index + ", " + name2 + " at " + name2Index);
			}
		}
		else {
			alert("could not find coin flip");
		}
	}

	while (1) {
		tmp++; // increment 
		ptr2=intext.indexOf("Offensive Package Was", ptr1); // find next "Offensive Package Was" after ptr1 
		if (ptr2<0) {
			break; // if no more offensive plays, leave 
		}
		endptr=ptr2; 
		ptr3=intext.lastIndexOf("<span style='font-size:13;'>", ptr2); // find start of the final PBP line from this play 

		ptr7=intext.indexOf("Two Minute Warning", ptr3); // if imediately before the two minute warning, look for the line before it
		if (ptr7!=-1 && ptr7 < endptr) {
			ptr4=ptr3-28;
			ptr3=intext.lastIndexOf("<span style='font-size:13;'>", ptr4);
		}

		ptr4=intext.indexOf("ouchdown", ptr3); // find next touchdown after start of the final PBP line 
		if (ptr4>ptr3 && ptr4 < ptr2) { // if the touchdown is after the start of the final PBP line and before the package info
			isTouchdown=1; 
			ptr3=intext.lastIndexOf("<span style='font-size:13;'>", endptr-5); // sets ptr3 to the final PBP line  
		} // if ptr4>ptr3 ...
		ptr6=intext.lastIndexOf("was the man covering on the play"); 
		if (ptr6!=-1 && ptr6 < endptr) {
			ptr3=intext.lastIndexOf("<span style='font-size:13;'>", ptr3-5);
		}
        
        ptr6=intext.indexOf("was the man covering on the play", preptr);
        if (ptr6!=-1 && ptr6 < endptr) {
        	ptr7=intext.lastIndexOf("&lookatplayer=", ptr6);
            if (ptr7!=-1 && ptr7<ptr6) {
            	ptr8=intext.indexOf("&", ptr7+14);
                if (ptr8!=-1 && ptr8<ptr6) {
                    passDefenderpID = parseInt(intext.substring(ptr7+14, ptr8));
                    ptr9=intext.indexOf("<b>", ptr8);
                    if (ptr9!=-1 && ptr9<ptr6) {
                    	passDefenderName = intext.substring(ptr9+3, ptr6-9);
                    }
                }
            }
        }
        else {
        	passDefenderpID = -1;
        }
       	
        startNext=intext.indexOf("<span style='font-size:13;'>", ptr2); // find the first PBP line on the next play (to find penalties)
        
		pkg=intext.substring(ptr2+29, ptr2+38); // get the offensive personel package 
		pkgid=getPkgid(pkg);
        
        ptr4=intext.indexOf("Defensive Package Was", ptr2);
        if (ptr4!=-1 && ptr4 < startNext) {
            defpkg=intext.substring(ptr4+29, ptr4+34);
            defpkgid=getDefPkgid(defpkg);
        }

		if (startThis==0) {
			startThis=preptr; 
		}
		ptr4=intext.indexOf("2 Point Conversion.", preptr); 
		if (ptr4!=-1 && ptr4<endptr) {
			preptr=ptr4; 
		}

		ptr4=intext.indexOf("<b>", ptr3); // find location of first bolding on last line 
		ptr5=intext.indexOf("</b>", ptr4+3); // find location of close of first bolding 
		abbr=intext.substring(ptr4+3, ptr5); // get bolded text (offensive team abbr) 

		ptr4=intext.indexOf("<b>", ptr5+4); // find second bolding: quarter and time remaining 
		ptr7=intext.indexOf("</b>", ptr4+3); 
		gameTime=intext.substring(ptr4+3, ptr7); // store string with quarter and time remaining. 

		ptr4=intext.indexOf("<b>", ptr7+4); // third bolding: down and distance
		//ptr7=intext.indexOf("</b>", ptr4+3); 
		down=intext.substring(ptr4+4, ptr4+7); // store down ("1st", "2nd", etc)
		ptr7=intext.indexOf(";", ptr4); // find end of distance ("Foot~", "13+", etc)
		togo=intext.substring(ptr4+12, ptr7); // store distance 
		endToGo=intext.substring(ptr7-1, ptr7); // get the final char before the ";", which may or not be a "+" or "-" 

		ptr4=intext.indexOf("a gain of", preptr); // find next "a gain of", if it exists and is before the end move it to ptr5
		loss=0; 
		hadYards=1; 
		if (ptr4!=-1 && ptr4<endptr) {
			ptr5=ptr4;
		}
		else {
			ptr4=intext.indexOf("a LOSS of", preptr); // do previous for "a loss of" 
			if (ptr4!=-1 && ptr4<endptr) { 
				ptr5=ptr4; loss=1; 
			}
			else {
				ptr4=intext.indexOf(" gains ", preptr); // do previous for "gains" 
				if (ptr4!=-1 && ptr4<endptr) {
					ptr5=ptr4;
				}
				else {
					ptr4=intext.indexOf(" loses ", preptr); // do previous for "loses" 
					if (ptr4!=-1 && ptr4<endptr) { 
						ptr5=ptr4; loss=1; 
					}
					else {
						ptr4=intext.indexOf(" keeps it and runs ", preptr); 
						if (ptr4!=-1 && ptr4<endptr) {
							ptr5=ptr4; 
						}
						else {
							ptr4=intext.indexOf("SACKED", preptr); 
							if (ptr4!=-1 && ptr4<endptr) {
								ptr5=ptr4; 
								loss=1; 
							}
							else {
								ptr5=-1; // set ptr to -1 (no loss or gain on the play) 
								hadYards=0; 
							} // else 
						} // else 
					} // else 
				} // else 
			} // else 
		} // else  
		if (ptr5!=-1) { // if a play happened 
			ptr4=intext.indexOf("class='supza'>", ptr5); // find tag for yardage 
			if (ptr4!=-1 && ptr4<endptr) { // if yardage happened 
				ptr5=intext.indexOf("</span>", ptr4+14); // find end of yardage tag
				yard=intext.substring(ptr4+14, ptr5); // get full yardage 
				ptr4=intext.indexOf("class='supz'>", ptr5);
				ptr5=intext.indexOf("</span>", ptr4+13);
				yard2=intext.substring(ptr4+13, ptr5); // get decimal yardage 
				if (loss==0) { // combine into one value 
					yard=parseInt(yard) + parseInt(yard2)/100; 
				} else if (loss==1) {
					yard= -1 * (Math.abs(parseInt(yard)) + parseInt(yard2)/100); 
				} // */
			} // if ptr4!=-1 ... 
			else yard=0;
		} // if ptr5!=-1 
		else yard=0;

		ptr4=intext.indexOf("penalty", startThis); // test if play was a penalty 
		if (ptr4!=-1 && ptr4<startNext) {
			ptr4=intext.indexOf("enalty <b>declined</b>", startThis); 
			if (ptr4!=-1 && ptr4<startNext) { 
				//alert("penalty declined! game time = " + gameTime);
				penalty=0; 
				noPlay=0; 
			}
			else {
				penalty=1; 
				ptr4=intext.indexOf(" assessed at the end of ", startThis); 
				if (ptr4!=-1 && ptr4<startNext) {
					noPlay = 0; 
				} 
				else {
					ptr4=intext.indexOf("enalty <b>accepted</b>", startThis); 
					if (ptr4!=-1 && ptr4<startNext) {
						//alert("penalty accepted! game time = " + gameTime); 
						noPlay = 1; 
					}
					else {
                    	ptr4=intext.indexOf(" yard penalty; Automatic First Down!", startThis);
                        if (ptr4!=-1 && ptr4<startNext) {
                        	noPlay = 1;
                       	}
                        else {
                        	noPlay = 0;
                        }
					}
				}
			}
		}
		else {
			penalty=0; 
			noPlay=0; 
		}

		ptr4=intext.indexOf(" primary option was ", preptr); // test for GCOVs 
		if (ptr4!=-1 && ptr4<endptr) {
			GCOV=1; 
			GCOVd = intext.substring(ptr4+20, ptr4+23); 
			GCOVdID = getWRID(GCOVd);
            
            // get name and ID for the reciever
            ptr5=intext.indexOf("&lookatplayer=", ptr4);
            if (ptr5!=-1 && ptr5<ptr4+100) {
            	ptr4=intext.indexOf("&", ptr5+14);
                if (ptr4!=-1 && ptr4<ptr5+30) { // if a player with an id longer than 16 digits exists, this will break
                	GCOVdpID = intext.substring(ptr5+14, ptr4);
                    GCOVdpID = parseInt(GCOVdpID);
                    
                    ptr5=intext.indexOf("<b>", ptr4+11);
                    if (ptr5!=-1 && ptr5<ptr4+17) {
                    	ptr4=intext.indexOf("</b>", ptr5+3);
                        if (ptr4!=-1 && ptr4<ptr5+50) {
                        	GCOVdName = intext.substring(ptr5+3, ptr4);
                        }
                    }
                }
            }
            
            ptr6=intext.indexOf(" Good coverage by ", ptr4);
            if (ptr6!=-1 && ptr6<endptr) {
            	GCOVer = intext.substring(ptr6+18, ptr6+22);
            }
            
            // get name and ID for the defender
            ptr5=intext.indexOf("</a> on the play.", ptr6);
            if (ptr5!=-1 && ptr5<endptr) {
            	ptr4=intext.lastIndexOf("&lookatplayer=", ptr5);
                if (ptr4!=-1 && ptr4<ptr5) {
                	ptr6=intext.indexOf("&", ptr4+14);
                    if (ptr6!=-1 && ptr6<ptr5) {
                    	GCOVerID = parseInt(intext.substring(ptr4+14, ptr6));
                        ptr7=intext.indexOf("<b>", ptr4+14);
                        if (ptr7!=-1 && ptr7<ptr5) {
                        	GCOVerName = intext.substring(ptr7+3, ptr5-4);
                        }
                    }
                }
            }
            //alert("GCOV by the " + GCOVer + ". Name = " + GCOVerName + ", pID = " + GCOVerID);
		} 
		else {
			GCOV=0; 
			GCOVd=-1; 
			GCOVdID=-1; 
            GCOVdpID=-1;
            GCOVerID=-1;
		}

		ptr4=intext.indexOf("dump it off", preptr); // test if play was a dumpoff 
		if (ptr4!=-1 && ptr4<endptr) {
			dumpoff=1;
		}
		else {
			dumpoff=0;
		}

		ptr4=intext.indexOf("scrambles..", preptr); 
		if (ptr4!=-1 && ptr4<endptr) {
			scramble=1; 
            WRID = -1;
            WRpID = -1;
            passDefenderpID = -1;
		}
		else scramble=0;
        
        ptr4=intext.indexOf("t see anyone open ", preptr);
        if (ptr4!=-1 && ptr4<endptr) {
        	coverScram = 0;
        }

		ptr4=intext.indexOf("INTERCEPTED by", preptr); 
		if (ptr4!=-1 && ptr4<endptr) {
			INT = 1;
			//pdef = 1;
            comp = 0;
            defPlaymaker = intext.substring(ptr4+15, ptr4+19);
            ptr5 = intext.indexOf("&lookatplayer=", ptr4);
            if (ptr5!=-1 && ptr5<endptr) {
            	ptr6 = intext.indexOf("&", ptr5+14);
                if (ptr6!=-1 && ptr6<endptr) {
                	defPlaymakerpID = parseInt(intext.substring(ptr5+14, ptr6));
                    ptr7 = intext.indexOf("<b>", ptr6);
                    if (ptr7!=-1 && ptr7<endptr) {
                    	ptr8 = intext.indexOf("</b>", ptr7+3);
                        defPlaymakerName = intext.substring(ptr7+3, ptr8);
                    }
                }
            }
		} 
		else {
			INT = 0;
		}

		ptr4=intext.indexOf(".. credit ", preptr); // pass deflections 
		if (ptr4!=-1 && ptr4<endptr) {
			pdef = 1;
			comp = 0;
            defPlaymaker = intext.substring(ptr4+15, ptr4+19);
            ptr5 = intext.indexOf("&lookatplayer=", ptr4);
            if (ptr5!=-1 && ptr5<endptr) {
            	ptr6 = intext.indexOf("&", ptr5+14);
                if (ptr6!=-1 && ptr6<endptr) {
                	defPlaymakerpID = parseInt(intext.substring(ptr5+14, ptr6));
                    ptr7 = intext.indexOf("<b>", ptr6);
                    if (ptr7!=-1 && ptr7<endptr) {
                    	ptr8 = intext.indexOf("</b>", ptr7+3);
                        defPlaymakerName = intext.substring(ptr7+3, ptr8);
                    }
                }
            }
		}
		else {
			//if (INT == 0) {
			pdef = 0;
			//}
		}

		ptr4=intext.indexOf("tackled by ", preptr); // tackles
		if (ptr4!=-1 && ptr4<endptr) {
			tkl = 1;
			defPlaymaker = intext.substring(ptr4+15, ptr4+19);
            ptr5 = intext.indexOf("&lookatplayer=", ptr4);
            if (ptr5!=-1 && ptr5<endptr) {
            	ptr6 = intext.indexOf("&", ptr5+14);
                if (ptr6!=-1 && ptr6<endptr) {
                	defPlaymakerpID = parseInt(intext.substring(ptr5+14, ptr6));
                    ptr7 = intext.indexOf("<b>", ptr6);
                    if (ptr7!=-1 && ptr7<endptr) {
                    	ptr8 = intext.indexOf("</b>", ptr7+3);
                        defPlaymakerName = intext.substring(ptr7+3, ptr8);
                    }
                }
            }
		}
		else {
			ptr4=intext.indexOf("ridden out of bounds by ", preptr);
			if (ptr4!=-1 && ptr4<endptr) {
				tkl = 1;
				defPlaymaker = intext.substring(ptr4+15, ptr4+19);
	            ptr5 = intext.indexOf("&lookatplayer=", ptr4);
	            if (ptr5!=-1 && ptr5<endptr) {
	            	ptr6 = intext.indexOf("&", ptr5+14);
	                if (ptr6!=-1 && ptr6<endptr) {
	                	defPlaymakerpID = parseInt(intext.substring(ptr5+14, ptr6));
	                    ptr7 = intext.indexOf("<b>", ptr6);
	                    if (ptr7!=-1 && ptr7<endptr) {
	                    	ptr8 = intext.indexOf("</b>", ptr7+3);
	                        defPlaymakerName = intext.substring(ptr7+3, ptr8);
	                    }
	                }
	            }
			}
			else {
				tkl = 0;
			}
		} // */

		pass=0; // test if pass play 
		ptr4=intext.indexOf(" pass ", preptr);
		if (ptr4!=-1 && ptr4<endptr) {
			pass=1; 
			ptr5=intext.indexOf("<b>AMAZING</b> catch by ", preptr); 
			if (ptr5!=-1 && ptr5<endptr) {
            	comp = 1;
				WR = intext.substring(ptr5+24, ptr5+27);
				WRID = getWRID(WR);
                
                ptr6=intext.indexOf("&lookatplayer=", ptr5+27);
                if (ptr6!=-1 && ptr6<ptr5+100) {
                	ptr7=intext.indexOf("&", ptr6+14);
                    if (ptr7!=-1 && ptr7<ptr6+30) {
                    	WRpID = intext.substring(ptr6+14, ptr7);
                        WRpID = parseInt(WRpID);
                        
                        ptr5=intext.indexOf("<b>", ptr7+11);
                    	if (ptr5!=-1 && ptr5<ptr7+17) {
                    		ptr6=intext.indexOf("</b>", ptr5+3);
                        	if (ptr6!=-1 && ptr6<ptr5+50) {
                        		WRName = intext.substring(ptr5+3, ptr6);
                        	}
                    	}
                    }
                }
                //alert("Amazing catch by " + WR + ". Name = " + WRName + ", pID = " + WRpID);
			}
			else {
				WRID = -1;
                WRpID = -1;
			}
		}

		ptr4=intext.indexOf(" throwing ", preptr);
		if (ptr4!=-1 && ptr4<endptr) {
			pass=1; 
		}

		ptr4=intext.indexOf("threw the ball away", preptr);
		if (ptr4!=-1 && ptr4<endptr) { 
			pass=1;
            comp=0;
			WRID=-1;
            WRpID=-1;
            passDefenderpID=-1;
		}

		ptr4=intext.indexOf(" Pass by", preptr);
		if (ptr4!=-1 && ptr4<endptr) {
			pass=1; 
			ptr5=intext.indexOf(" to ", ptr4); 
			ptr6=intext.indexOf(",to ", ptr4); 
			if (ptr5!=-1 && ptr5<endptr && intext.substring(ptr5+4, ptr5+7)!="exe") {
				WR = intext.substring(ptr5+4, ptr5+7);
                
                ptr8=intext.indexOf("&lookatplayer=", ptr5+27);
                if (ptr8!=-1 && ptr8<ptr5+100) {
                	ptr7=intext.indexOf("&", ptr8+14);
                    if (ptr7!=-1 && ptr7<ptr8+30) {
                    	WRpID = intext.substring(ptr8+14, ptr7);
                        WRpID = parseInt(WRpID);
                        
                        ptr9=intext.indexOf("<b>", ptr7+11);
                    	if (ptr9!=-1 && ptr9<ptr7+17) {
                    		ptr8=intext.indexOf("</b>", ptr9+3);
                        	if (ptr8!=-1 && ptr8<ptr9+50) {
                        		WRName = intext.substring(ptr9+3, ptr8);
                        	}
                    	}
                    }
                }
                //alert("Pass thrown to " + WR + ". Name = " + WRName + ", pID = " + WRpID);
			}
			else if (ptr6!=-1 && ptr6<endptr) {
				WR = intext.substring(ptr6+4, ptr6+7);
                
                ptr8=intext.indexOf("&lookatplayer=", ptr6+27);
                if (ptr8!=-1 && ptr8<ptr6+100) {
                	ptr7=intext.indexOf("&", ptr8+14);
                    if (ptr7!=-1 && ptr7<ptr8+30) {
                    	WRpID = intext.substring(ptr8+14, ptr7);
                        WRpID = parseInt(WRpID);
                        
                        ptr9=intext.indexOf("<b>", ptr7+11);
                    	if (ptr9!=-1 && ptr9<ptr7+17) {
                    		ptr8=intext.indexOf("</b>", ptr9+3);
                        	if (ptr8!=-1 && ptr8<ptr9+50) {
                        		WRName = intext.substring(ptr9+3, ptr8);
                        	}
                    	}
                    }
                }
                //alert("Pass thrown to " + WR + ". Name = " + WRName + ", pID = " + WRpID);
			}
			else {
				ptr5=intext.indexOf("DROPPED by ", preptr); 
				if (ptr5!=-1 && ptr5<endptr) {
					WR = intext.substring(ptr5+11, ptr5+14); 
					//alert("drop by " + WR + ", readcount = " + readcount + ", tmp = " + tmp + ", abbr = " + abbr); 
					drop = 1;
                    comp = 0;
                    
                    ptr8=intext.indexOf("&lookatplayer=", ptr5+27);
                    if (ptr8!=-1 && ptr8<ptr5+100) {
                        ptr7=intext.indexOf("&", ptr8+14);
                        if (ptr7!=-1 && ptr7<ptr8+30) {
                            WRpID = intext.substring(ptr8+14, ptr7);
                            WRpID = parseInt(WRpID);
                            
                            ptr9=intext.indexOf("<b>", ptr7+11);
                            if (ptr9!=-1 && ptr9<ptr7+17) {
                                ptr8=intext.indexOf("</b>", ptr9+3);
                                if (ptr8!=-1 && ptr8<ptr9+50) {
                                    WRName = intext.substring(ptr9+3, ptr8);
                                }
                            }
                        }
                    }
                    //alert("Pass dropped by " + WR + ". Name = " + WRName + ", pID = " + WRpID);
				}
				else {
					WRID = -1; 
                    WRpID = -1;
					drop = 0; 
				}
			}
			if (WR != "exe") {
				WRID = getWRID(WR); 
			} 
			else {
				WRID = -1;
                WRpID = -1;
			} // */
		}
        ptr4=intext.indexOf(" <b>COMPLETE</b> ", preptr);
        if (ptr4!=-1 && ptr4<endptr) {
        	comp = 1;
        }
        else {
        	comp = 0;
        }

		if (pass==0 && scramble==1) {
			pass=1;
		}
		if (pass) {
			att=1; 
		}
		else {
			att=0;
		}
		if (scramble) {
			att=0;
		}
		ptr4=intext.indexOf("SACKED", preptr); // test if play was a sack 
		if (ptr4!=-1 && ptr4<endptr) { 
			att=0; 
			pass=1; 
			sack=1; 
		} 
		else { 
			sack=0; 
		}
        
        if (att == 0) {
            WRID = -1;
            WRpID = -1;
            passDefenderpID = -1;
        }

		run=0; 
		ptr4=intext.indexOf(" Handoff to ", preptr); 
		if (ptr4!=-1 && ptr4<endptr) { 
			run=1; 
			handoff=1; 
		}

		ptr4=intext.indexOf(" keeps it and runs ", preptr); 
		if (ptr4!=-1 && ptr4<endptr) { 
			run=1; 
			sneak=1; 
		}
		if (run==1 && (scramble==1 || sack==1)) { 
			run=0; 
		} // */

		if (att == 1) {
			ptr4=intext.indexOf(" yard(s) downfield, ", preptr); 
			if (ptr4!=-1 && ptr4<endptr) {
				ptr5=intext.indexOf("class='supza'>", ptr4-70); 
				if (ptr5!=-1 && ptr5<endptr) {
					ptr4=intext.indexOf("</span>", ptr5+14);
                    var sign = intext.substring(ptr5+14, ptr5+15);
					attYard=intext.substring(ptr5+14, ptr4);
					ptr5=intext.indexOf("class='supz'>", ptr4); 
					ptr4=intext.indexOf("</span>", ptr5+13); 
					attYard2=intext.substring(ptr5+13, ptr4);
                    if (sign == "-") {
                    	attYard = -1 * (Math.abs(parseInt(attYard)) + parseInt(attYard2)/100);
                    }
					else {
                    	attYard = parseInt(attYard) + parseInt(attYard2)/100;
                    }
				}
			}
		}
        else {
        	attYard = "";
        }

		/*if (correctAbbr(abbr, showOffense) && hadYards && (noPlay == 0)) {
			tempYardCounter+=yard; 
			alert("Play with yardage: offense moved " + yard.toFixed(2) + ". down/dist = " + down + " and " + togo + ", game time = " + gameTime + ".\nYards thus far = " + tempYardCounter.toFixed(2)); 
		} // */
		
		distToGo=getDistToGo(togo, endToGo); 

		isSuccess=getSuccess(yard, distToGo, down, isTouchdown);     

		if (correctAbbr(abbr, showOffense) && (run==1 || pass==1) && distToGo!=-1 && isSuccess!=-1 && pkgid>=0 && pkgid<=7 && (noPlay==0) || withPens) { 
			if (down=="1st") {
				downDistID=0; 
				checkRunPass(run, pass, pkgid, downDistID, yard, isSuccess); 
			} else if (down=="2nd") {
				if (distToGo>=0 && distToGo<=shortSplit) {
					downDistID=1; 
				} else if (distToGo>shortSplit && distToGo<=longSplit) {
					downDistID=2; 
				} else if (distToGo>longSplit) {
					downDistID=3; 
				}
				checkRunPass(run, pass, pkgid, downDistID, yard, isSuccess); 
			} else if (down=="3rd" || down=="4th") {
				if (distToGo>=0 && distToGo<=shortSplit) {
					downDistID=4; 
				} else if (distToGo>shortSplit && distToGo<=longSplit) {
					downDistID=5; 
				} else if (distToGo>longSplit) {
					downDistID=6; 
				}
				checkRunPass(run, pass, pkgid, downDistID, yard, isSuccess); 
			} 
		} // if isAbbr(abbr) ... 
        
		if (correctAbbr(abbr, showOffense) && (WRTargetSplits || WRProductionSplits) && (noPlay==0 || withPens)) {
			if (att==1 && WRID!=-1) {
				if (!(WRID > -1)) {
					alert("Something broke. WRID = " + WRID + ", readcount = " + readcount + ", tmp = " + tmp); 
				}
				WRSplitStats[pkgid][downDistID][WRID][5]++; // increment targets 
				WRSplitStats[pkgid][downDistID][WRID][6] += yard; // add to yards 
				if (dumpoff==0 && GCOV==0) {
					WRSplitStats[pkgid][downDistID][WRID][1]++; // increment first option passes 
				} 
				else if (dumpoff) {
					WRSplitStats[pkgid][downDistID][WRID][2]++; // increment dumpoff passes 
				} 
				if (dumpoff==0 && attYard!="") {
					WRSplitStats[pkgid][downDistID][WRID][4]+=attYard; // add to attempted yards 
				} 
				if (dumpoff==0 && attYard=="") {
					WRSplitStats[pkgid][downDistID][WRID][3]++; // increment drops on downfield passes and passes batted at the line 
				}
				if (isSuccess == 1) {
					WRSplitStats[pkgid][downDistID][WRID][7]++; // increment successes 
				} // */
				if (INT == 1) {
					WRSplitStats[pkgid][downDistID][WRID][8]++; // increment interceptions 
				} 
			} // */

			if (WRID == GCOVdID && WRID!=-1) {
				alert("Something broke. WR = " + WR + " (" + WRID + "), GCOVd = " + GCOVd + " (" + GCOVdID + "), tmp = " + tmp + ", abbr = " + abbr + ", downDistID = " + downDistID + ", game time = " + gameTime); 
			}

			if (GCOVdID!=-1) {
				WRSplitStats[pkgid][downDistID][GCOVdID][0]++; // increment GCOVs
			}
		}
        
        if (defPkgSplits && (showBothTeams || !correctAbbr(abbr, showOffense) || bothTeamsValid) && (noPlay == 0 || withPens)) {
            defPkgSplitStats[defpkgid][0]++;
            if (run) {
                defPkgSplitStats[defpkgid][1]++;
            }
            else if (pass) {
                defPkgSplitStats[defpkgid][2]++;
            }
            /*else {
            	alert("run = 0, pass = 0, tmp = " + tmp);
            } // */
        }
        
        if (conversions && (showBothTeams || correctAbbr(abbr, showOffense)) && (noPlay == 0 || withPens) && (down == "3rd" || down == "4th")) {
            var downDistID = get3rd4thDownDistID(distToGo);
            if (downDistID == -1) {
                alert("downDistID == -1"); 
            }
            else {
                conversionStats[downDistID][0]++;
                if (isSuccess) {
                    conversionStats[downDistID][1]++;
                    conversionStats[downDistID][2] += yard;
                }
                else {
                    conversionStats[downDistID][3] += yard;
                }
            }
        }
        
        if (individualWRStats && (showBothTeams || correctAbbr(abbr, showOffense)) && (noPlay == 0 || withPens)) {
        	var index = -1;
            
            // player ID, name, 1st opt passes, targets, yards, successes, GCOVs, INTs, Drops, dump passes, dist downfield, position, catches
            if (GCOVdpID != -1) {
            	//alert("GCOV of reciever " + GCOVdName + ". tmp = " + tmp);
            	index = checkWRList(GCOVdpID, GCOVdName, GCOVd);
                WRPlayerStats[index][6]++; // increment GCOVs
            }
        	if (WRpID != -1) {
            	//alert("pass targeted at reciever " + WRName + ". tmp = " + tmp);
            	index = checkWRList(WRpID, WRName, WR);
                WRPlayerStats[index][3]++; // increment targets
                WRPlayerStats[index][4] += yard;
                if (GCOV == 0 && dumpoff == 0) {
                	WRPlayerStats[index][2]++; // increment 1st option passes
                }
                if (dumpoff == 0 && attYard != "" && !isNaN(attYard)) {
                	WRPlayerStats[index][10] += attYard;
                }
                else if (dumpoff == 0 && (attYard == "" || isNaN(attYard))) {
                	WRPlayerStats[index][8]++; // increment drops (and passes batted down at the line) 
                }
                else {
                	WRPlayerStats[index][9]++; // increment dumpoffs
                }
                if (isSuccess) {
                	WRPlayerStats[index][5]++;
                }
                if (comp) {
                	WRPlayerStats[index][12]++; // increment completions
                }
                if (INT) {
                	WRPlayerStats[index][7]++; // increment interceptions
                }
                if (pdef) {
                	WRPlayerStats[index][13]++; // increment pass deflections
                }
            }
        }

        /*if (!correctAbbr(abbr, showOffense)) {
        	alert("!correctAbbr(" + abbr + ", " + showOffense + "), play number " + tmp);
        } // */
        
        if (individualDefenderStats && (showBothTeams || !correctAbbr(abbr, showOffense) || bothTeamsValid) && (noPlay == 0 || withPens)) {
        	var index = -1;
            
            // player ID, name, 1st opt passes, targets, yards, successes, GCOVs, INTs, Drops, dump passes, dist downfield, catches
            if (GCOVerID != -1) {
            	//alert("GCOV of reciever " + GCOVdName + ". tmp = " + tmp);
            	index = checkIDPList(GCOVerID, GCOVerName);
                IDPStats[index][6]++; // increment GCOVs
            }
        	if (passDefenderpID != -1) {
                /*if (passDefenderName == "Some Cornerback") {
                    alert("found " + passDefenderName + " at " + gameTime);
                } // */
            	//alert("pass targeted at reciever " + WRName + ". tmp = " + tmp);
            	index = checkIDPList(passDefenderpID, passDefenderName);
                IDPStats[index][3]++; // increment targets
                IDPStats[index][4] += yard;
                if (GCOV == 0 && dumpoff == 0) {
                	IDPStats[index][2]++; // increment 1st option passes
                }
                if (dumpoff == 0 && attYard != "") {
                	IDPStats[index][10] += attYard;
                }
                else if (dumpoff == 0 && attYard == "") {
                	IDPStats[index][8]++; // increment drops (and passes batted down at the line) 
                }
                else {
                	IDPStats[index][9]++; // increment dumpoffs
                }
                if (isSuccess) {
                	IDPStats[index][5]++;
                }
                if (comp) {
                	IDPStats[index][12]++; // increment completions 
                }
            }
            if (defPlaymakerpID != -1) {
            	index = checkIDPList(defPlaymakerpID, defPlaymakerName);

            	// if playmaker was in coverage
            	if (defPlaymakerpID == passDefenderpID) {
	                if (INT) {
	                	IDPStats[index][7]++; // increment cv interceptions
	                }
	                if (pdef) {
	                	IDPStats[index][13]++; // increment cv pass deflections. 
	                }
	                if (tkl) {
	                	IDPStats[index][14]++; // increment cvTKL
	                }
	            }
	            else if (run == 1) {
	            	if (tkl) {
	            		IDPStats[index][18]++; // increment run TKL
	            		if (!isSuccess) {
	            			IDPStats[index][19]++; // increment run Stops
	            		}
	            	}
	            }
	            else {
	            	if (INT) {
	                	IDPStats[index][15]++; // increment rm interceptions
	                }
	                if (pdef) {
	                	IDPStats[index][16]++; // increment rm pass deflections. 
	                }
	                if (tkl) {
	                	IDPStats[index][17]++; // increment rmTKL
	                }
	            }
            }
        }
        
        if (passDistSplits && (showBothTeams || correctAbbr(abbr, showOffense)) && (noPlay == 0 || withPens) && (attYard != "" || dumpoff)) {
       		var distID = -1;
            if (dumpoff) {
            	distID = 0;
            }
            else {
            	distID = getPassDistID(attYard);
            }
            
            if (attYard == "") {
            	attYard = yard;
            }
            
            // att, comp, success, yards, attYards, YAC, YTG
            passDistSplitStats[distID][0]++; // increment attempts
            passDistSplitStats[distID][4]+=attYard;
            passDistSplitStats[distID][6]+=distToGo;
            if (comp) {
            	passDistSplitStats[distID][1]++; // increment completions
                passDistSplitStats[distID][3]+=yard;
                passDistSplitStats[distID][5]+= (yard - attYard);
            }
            if (isSuccess) {
            	passDistSplitStats[distID][2]++; // increment successes 
            }
            if (INT) {
            	passDistSplitStats[distID][7]++; // increment interceptions 
            }
            if (isTouchdown) {
            	passDistSplitStats[distID][8]++; // increment touchdowns
            }
        }
        
        if (sacks && (showBothTeams || correctAbbr(abbr, showOffense)) && (noPlay == 0 || withPens)) {
        	// pass plays, passes, sacks, pressure scrambles, cover scrambles, scramble sacks, dumpoffs, throw aways
            if (pass) {
            	sackStats[0]++; // increment passes
            }
            if (att) {
            	sackStats[1]++; // increment attempts
            }
            if (sack) {
            	sackStats[2]++; // increment sacks
                if (scramble) {
                	sackStats[5]++; // increment scramble sacks
                }
            }
            // no pressure scrambles
            if (coverScram) {
            	sackStats[4]++; // increment cover scrambles
            }
            if (dumpoff) {
            	sackStats[6]++; // increment dumpoffs
            }
            if (throwAway) {
            	sackStats[7]++; // increment throw aways
            }
        }

		isTouchdown=0; 
		isSuccess=0; 
		ptr1=ptr2+21; 
		WRID=-1; 
        defPlaymakerpID = -1;
		attYard=""; 
		startThis=startNext; 
		preptr=endptr;

	} // while(1) 

	if (readcount<readtarget) {
		//alert("readcount = " + readcount + ", readtarget = " + readtarget + ", continuing!"); 
		readLog(); 
	} 
	else {
		//alert("finished with games!"); 
		var SR_def="<span title='Success Rate: Percentage of plays which are considered successful (meaning the offense is better off after them than they were before). A successful play is defined here as one which gains 45% of the required yardage on 1st down, 60% on 2nd down, and 100% on 3rd or 4th down. Definition paraphrased from footballoutsiders.com'>SR</span>"; 
		var YPP_def="<span title='Net yards per play'>Y/P</span>"; 
		var OPP_def="<span title='Offensive Pass Plays: All plays in which the offense originally intended to throw the ball. Includes passes, scrambles, and sacks.'>OPP</span>"; 
		var ORP_def="<span title='Offensive Run Plays: All plays in which the offense originally intended to run the ball. Includes handoffs and QB sneaks.'>ORP</span>"; 
		var FIRST_def="<span title='First Option Looks: The number of plays in which this reciever was the QBs first read. This inclues both GCOVs and passing targets (no dumpoffs)'>1st Opt</span>"; 
		var TGT_def="<span title='Downfield Passing Targets: The number of passes thrown to this reciever, excluding dumpoffs.'>TGT</span>"; 
		var DMP_def="<span title='Dumpoff Targets: The number of dumpoff passes thrown to this reciever.'>Dump</span>"; 
		var DIST_def="<span title='Average Distance Downfield: the average distance downfield of all passes thrown to this reciever, exluding dumpoffs and drops.'>Dist</span>"; 
		var YPT_def="<span title='Yards per Target: The average number of yards gained on a pass to this reciever'>Y/T</span>"; 
		var GCOVpct_def="<span title='Good Coverage Percentage: the percentage of first option looks to this reciever which result in a GCOV instead of a pass attempt'>GCOV%</span>"; 
		var INTpct_def="<span title='Interception Rate: the percentage of passes to this reciever which result in an interception by the defense'>INT%</span>";
		var SC_def="<span title='Success Count: the number of plays in which this player was targeted which were a net positive for the offense'>SR</span>"
        
        var tables = "";

		newDiv = document.getElementById('scout_count');
		
		if (runPassSplits) {
			for (var a=0; a<7; a++) {
				for (var c=0; c<2; c++) {
					for (var d=0; d<3; d++) {
						for (var b=0; b<8; b++) {
							sumDownStats[a][c][d]+=detailedPackageStats[a][b][c][d]; 
						}
					}
				}
			}

			for (var b=0; b<8; b++) {
				for (var c=0; c<2; c++) {
					for (var d=0; d<3; d++) {
						for (var a=0; a<7; a++) {
							sumPackageStats[b][c][d]+=detailedPackageStats[a][b][c][d]; 
						}
					}
				}
			}
            
            /*for (var a=0; a<7; a++) {
            	for (var b=0; b<2; b++) {
                	for (var c=0; c<3; c++) {
                    	sumAllPackages[a][b] += sumPackageStats
                   	}
                }
            } // */

			tables = tables.concat(makeTableLable("Rushing and Passing Splits") + make_old_r_p_table(SR_def, YPP_def, OPP_def, ORP_def)); 
		}
		if (WRTargetSplits) { 
			tables = tables.concat(makeTableLable("Reciever Target Splits") + make_WR_target_table(FIRST_def, TGT_def, DMP_def, DIST_def)); 
		} 
		if (WRProductionSplits) {
			tables = tables.concat(makeTableLable("Reciever Production Splits") + make_WR_production_table(GCOVpct_def, SR_def, YPT_def, INTpct_def)); 
		}
        if (defPkgSplits) {
        	tables = tables.concat(makeTableLable("Defensive Package Splits") + makeDefPkgSplitsTable());
        }
        if (conversions) {
            tables = tables.concat(makeTableLable("3rd/4th Downs") + makeConversionTable());
        }
        if (individualWRStats) {
        	tables = tables.concat(makeTableLable("Individual Reciever Stats") + makeIndividualWRStatTable());
        }
        if (individualDefenderStats) {
        	tables = tables.concat(makeTableLable("Individual Defensive Player Stats") + makeIDPStatTable());
        }
        if (passDistSplits) {
        	tables = tables.concat(makeTableLable("Pass Results By Distance") + makePassDistSplitTable());
        } // */
        
        newDiv.innerHTML = tables;
	}
};

function initializeArrays() {
	detailedPackageStats=new Array(7); // initialize stat array (1st down, 2nd & short, 2nd & medium, 2nd & long, 3rd/4th & short, 3rd/4th & medium, 3rd/4th & long) 
	for (var a=0; a<7; a++) { 
        var pkgs=new Array(8);  // initialize row of packages (HFT12, HFTt1, HTt12, HF123, HT123, H1234, T1234, 12345) 
        for (var b=0; b<8; b++) {
            var plays=new Array(2); // initialize row of play types (run/pass/unknown)
            for (var c=0; c<2; c++) {
                var stats=new Array(3); // initialize row of stats (plays, yards, successes) 
                for (var d=0; d<3; d++) {
                    stats[d]=0;  // initialize each slot in the array (filled in the ParsePBP function) 
                    
                }
                plays[c]=stats; 
            }
            pkgs[b]=plays; 
        }
        detailedPackageStats[a]=pkgs;  
    } 
    
    packageStats=new Array(7); // initialize stat array (1st down, 2nd & short, 2nd & medium, 2nd & long, 3rd/4th & short, 3rd/4th & medium, 3rd/4th & long) 
    for (var a=0; a<7; a++) { 
        var pkgs=new Array(8);  // initialize row of packages (HFT12, HFTt1, HTt12, HF123, HT123, H1234, T1234, 12345) 
        for (var b=0; b<8; b++) {
            var tmp=new Array(2); // initialize row of play types (run/pass/unknown)
            for (var c=0; c<2; c++) {
                tmp[c]=0;  // initialize each slot in the array (filled in the ParsePBP function)  
            }
            pkgs[b]=tmp; 
        }
        packageStats[a]=pkgs;  
    } 
    
    packageYards=new Array(7)
    for (var x=0; x<7; x++) { 
        var pkgs=new Array(8);  
        for (y=0; y<8; y++) {
            var tmp=new Array(2); 
            for (var z=0; z<2; z++) {
                tmp[z]=0;  
            }
            pkgs[y]=tmp; 
        }
        packageYards[x]=pkgs; 
    }
    
    sumPackageStats=new Array(8); 
    for (var b=0; b<8; b++) {
        var plays=new Array(2); 
        for (c=0; c<2; c++) {
            var stats=new Array(3); 
            for (d=0; d<3; d++) {
                stats[d]=0; 
            }
            plays[c]=stats; 
        }
        sumPackageStats[b]=plays; 
	}

	sumDownStats=new Array(7); 
    for (var a=0; a<7; a++) {
		var plays=new Array(2); 
		for (c=0; c<2; c++) {
			var stats=new Array(3); 
			for (d=0; d<3; d++) {
				stats[d]=0; 
			}
			plays[c]=stats; 
		}
		sumDownStats[a]=plays; 
	}
    
    sumAllPackages = new Array(2);
    for (var a=0; a<2; a++) {
    	var stats = new Array(3);
        for (var b=0; b<3; b++) {
        	stats[b] = 0;
        }
        sumAllPackages[a] = stats;
    } // */

	WRSplitStats= new Array(8); 
	for (var a=0; a<8; a++) { // 8 packages 
		var DDs=new Array(7); 
		for (b=0; b<7; b++) { // 7 down and distance combos
			var WRs=new Array(9); 
			for (c=0; c<9; c++) { // 9 recievers 
				var stats=new Array(9); 
				for (d=0; d<9; d++) { // 9 stats (to date) - GCOVs, 1st opt passes, dump passes, drops, dist downfield, targets, yards, successes, INTs. 
					stats[d] = 0; 
				}
				WRs[c]=stats; 
			}
			DDs[b]=WRs; 
		}
		WRSplitStats[a]=DDs; 
	}
    
    defPkgSplitStats= new Array(19);
    for (var a=0; a<19; a++) {
        var stats = new Array(3); // 3 stats: total snaps, run plays, pass plays. 
        for (var b=0; b<3; b++) {
            stats[b] = 0;
        }
        defPkgSplitStats[a] = stats;
    }
    
    conversionStats = new Array(16);
    for (var a=0; a<16; a++) {
        var stats = new Array(4); // 4 stats: attempts, conversions, yards on conversions, yards on stops.
        for (var b=0; b<4; b++) {
            stats[b] = 0;
        }
        conversionStats[a] = stats;
    }
    
    passDistSplitStats = new Array(18);
    for (var a=0; a<18; a++) {
    	var stats = new Array(); // att, comp, success, yards, attYards, YAC, YTG, INT, TD
        for (var b=0; b<9; b++) {
        	stats[b] = 0;
        }
        passDistSplitStats[a] = stats;
    } // */
    
    sackStats = new Array(8); // pass plays, passes, sacks, pressure scrambles, cover scrambles, scramble sacks, dumpoffs, throw aways
    for (var a=0; a<8; a++) {
    	sackStats[a] = 0;
    }
}


function readLog() {

	GM_xmlhttpRequest({
			method: 'GET',
			url: 'http://deeproute.com/default.asp?js=loggerinc&viewpbp=' + links[readcount],
			headers: {
				 'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
				 'Accept': 'application/atom+xml,application/xml,text/xml',
			},
			onload: function(detail) {
					parsePBP(detail.responseText);
			},
		});
}


function startReadLog() {
	
	if (readcount>=readtarget) return;
    
	readtarget=links.length; 

	var target = document.getElementById('scout_button_table');
    var newDiv;
    if (isFirstRun) {
        newDiv = document.createElement('div');
		newDiv.setAttribute("id", "scout_count");
        isFirstRun = 0;
    }
    else {
        newDiv = document.getElementById('scout_count');
    }
    newDiv.innerHTML='<span style="background-color:white">0 of ' + readtarget + ' games</span>';
    if (target) {
        target.parentNode.insertBefore(newDiv, target.nextSibling);
    }
    //alert("through startReadLog");

	readLog();
};


function parseStanding(intext)
{
	var ptr1=0, ptr2, ptr3, ptr4, name, abbr;
		while (ptr1>=0) {
				ptr2=intext.indexOf("class=sbu", ptr1);
				if (ptr2<0) {
					break;
				}
				ptr3=intext.indexOf("<b>", ptr2);
				ptr4=intext.indexOf("<br>", ptr3);
				name=intext.substring(ptr3+3, ptr4) + ' ';
				ptr3=intext.indexOf("</b>", ptr4+4);
				name+=intext.substring(ptr4+4, ptr3);

				ptr2=intext.indexOf("class=norm>", ptr3);
				ptr3=intext.indexOf("</a>", ptr2+11);
				abbr=intext.substring(ptr2+11, ptr3);

				teamlist[teamlist.length]=name;
				abbrlist[abbrlist.length]=abbr;
				
			ptr1=ptr3+4;
		}
	 
		startFunc();
}

// pull the team names and abbrs from the team preseason stats page 
function parseTeamStatsForAbbrs(intext) {
	var ptr1, ptr2, ptr3, ptr4, name, abbr, idnum;

	ptr1 = intext.indexOf("<th>STPG</th>", 0); 
	while (ptr1 >= 0) {
		ptr2 = intext.indexOf("myteamno=", ptr1); 
		if (ptr2 < 0) {
			break; 
		}

		ptr3 = intext.indexOf("\">", ptr2); 
		idnum = intext.substring(ptr2+9, ptr3); 
		ptr4 = intext.indexOf("</a>", ptr3); 
		name = intext.substring(ptr3+2, ptr4); 

		ptr2 = intext.indexOf("<b>", ptr4); 
		ptr3 = intext.indexOf("</b>", ptr2+3); 
		abbr = intext.substring(ptr2+3, ptr3); 

		teamlist[idnum-1]=name;
		abbrlist[idnum-1]=abbr;
        
		ptr1=ptr3+4; 
	}

	startFunc();
}


function buildGameList(input) 
{
	var ptr1, ptr2, ptr3, ptr4, id, id2, name, endptr;

	teams=[];
	abbrs=[];
    weeks=[];

	var checkbox = getElementsByClassName('team_checkbox', document); // array of elements including the term "team_checkbox" in the (scedule?) page. 

	for (var i=0; i < checkbox.length; i++) { // for each element in checkbox
		 if (checkbox[i].checked) {            // if the checkbox for this team is checked 
				teams[teams.length]=teamlist[i];   // add team and team abbreviation to appropriate array 
				abbrs[abbrs.length]=abbrlist[i];
		 }
	}
    
    if (teams.length == 0) {
    	alert("Please select a valid team");
    }


	ptr1=input.indexOf("\"teaminfo\"", 0);            // location of the first occurence of "teaminfo\" in input (the scedule page?) 
	if (ptr1<0) ptr1=input.indexOf("teaminfo ", 0);   // if "teaminfo\" is not there, find first occurence of "teaminfo " in input
	endptr=input.indexOf("hidden", ptr1+8);           // location of "hidden" in input, starting 8 chars after "teaminfo"

	while (1) {
		ptr2=input.indexOf("!", ptr1);  // ptr2 = location of "!" after 'teaminfo' (old ptr2 for later loops) 
		if (ptr2 > endptr) break; // if "!" is after "hidden", break 
		ptr3=input.indexOf("^", ptr2+1);  // ptr3 = location of "^" starting 1 char after "!" 
		id=input.substring(ptr2+1, ptr3); // id = all chars between the "!" and "^" 
		ptr2=input.indexOf("^", ptr3+1);  // ptr2 = location of "^" starting one char after "^" 
		name=input.substring(ptr3+1, ptr2); // name = all chars between "^" and "^" 
		if (isTeam(name)) teamID[teamID.length]=id; // if id is a valid team name, adds id to teamID array 
		ptr1=ptr2;
	}

	if (Preseason) {
        for (var i=0; i<4; i++) {
            if (document.getElementById("X-" + (i+1)).checked) {
                weeks[weeks.length]="X-" + (i+1) + "-".toString();
            }
        }
	}
	if (RegularSeason) {
		for (var i=0; i<16; i++) {
            if (document.getElementById("R-" + (i+1)).checked) {
                weeks[weeks.length]="R-" + (i+1) + "-".toString();
            }
        }
	} 
	if (Postseason) {
		for (var i=0; i<4; i++) {
            if (document.getElementById("P-" + (i+1)).checked) {
                weeks[weeks.length]="P-" + (i+1) + "-".toString();
            }
        }
	}
	
    endptr=input.indexOf("\"topper\"", ptr1+7);

    var weekcount = 0;
    while (weekcount < weeks.length) {
        ptr1=input.indexOf(weeks[weekcount], 0);
        while (ptr1 != -1 && ptr1 < endptr) {
            ptr2=input.indexOf("Y!", ptr1);
            if (ptr2 > endptr || ptr2<0) break;
            ptr3=input.indexOf("^", ptr2+2);
            id=input.substring(ptr2+2, ptr3);
            ptr2=input.indexOf("^", ptr3+1);
            id2=input.substring(ptr3+1, ptr2);
            
            if (isID(id) || isID(id2)) {
                ptr3=input.indexOf("^", ptr2+1);
                ptr2=input.indexOf("^", ptr3+1);
                ptr3=input.indexOf("^", ptr2+1);
                links[links.length]=input.substring(ptr2+1, ptr3);
            }
            ptr1=input.indexOf(weeks[weekcount], ptr1+3);
        }
        weekcount++;
	}
}


function fillGames(season) {
    var string = "<br><table border=\x220\x22 cellpadding=\x221\x22 style=\x22margin-left:20px;\x22 id=\x22" + season + "_spoiler_table\x22><col width=\x2240\x22><col width=\x2240\x22>";
    if (season == "pre") {
        for (var i=0; i<4; i++) {
            string = string.concat("<tr><td colspan=\x222\x22><input type=\x22checkbox\x22 name=\x22week\x22 class=\x22pre_checkbox\x22 id=\x22X-" + (i+1) + "\x22 checked=\x22checked\x22>Week " + (i+1) + "</input></td>");
        }
    }
    else if (season == "reg") {
    	for (var i=0; i<16; i++) {
            string = string.concat("<tr><td colspan=\x222\x22><input type=\x22checkbox\x22 name=\x22week\x22 class=\x22reg_checkbox\x22 id=\x22R-" + (i+1) + "\x22 checked=\x22checked\x22>Week " + (i+1) + "</input></td>");
        }
    }
    else if (season == "post") {
		for (var i=0; i<4; i++) {
            string = string.concat("<tr><td colspan=\x222\x22><input type=\x22checkbox\x22 name=\x22week\x22 class=\x22post_checkbox\x22 id=\x22P-" + (i+1) + "\x22 checked=\x22checked\x22>Week " + (i+1) + "</input></td>");
        }
    }
    string = string.concat("</table>");
    return string;
}

function addButtons(season) {
    var className = season + "_checkbox";
    var buttonDiv1 = document.createElement('div');
    buttonDiv1.innerHTML = '<input type="button" style="font-size: 6pt; font-weight: bold; width: 100%; height: 10px" value="Clear All">';
    buttonDiv1.addEventListener('click', function() {
		var checkbox = getElementsByClassName(className, document);  
		for (var i=0; i < checkbox.length; i++) 
			checkbox[i].checked=false;   
	}, true); // */
    
    var buttonDiv2 = document.createElement('div');
    buttonDiv2.innerHTML = '<input type="button" style="font-size: 6pt; font-weight: bold; width: 100%; height: 10px" value="Select All">';
    buttonDiv2.addEventListener('click', function() {
		var checkbox = getElementsByClassName(className, document);  
		for (var i=0; i < checkbox.length; i++) 
			checkbox[i].checked=true;   
	}, true); // */
    
    var spoilerTable = document.getElementById(season + "_spoiler_table");
    var newTR = document.createElement('tr');
    var newTD1 = document.createElement('td');
    var newTD2 = document.createElement('td');
    newTD1.appendChild(buttonDiv1);
    newTD2.appendChild(buttonDiv2);
    newTR.appendChild(newTD1);
    newTR.appendChild(newTD2);
    spoilerTable.appendChild(newTR);
} // */

function getGameDropdown(season) {
    var gameDropdown = 
    	"<a id=\x22" + season + "_show_id\x22 onclick=\x22document.getElementById('" + season + "_spoiler_id').style.display=''; document.getElementById('" + season + "_spoiler_span').style.display=''; document.getElementById('" + season + "_show_id').style.display='none';\x22 class=\x22link\x22>" + 
        " >></a> <a id=\x22" + season + "_spoiler_id\x22 style=\x22display: none\x22 onclick=\x22document.getElementById('" + season + "_spoiler_id').style.display='none'; document.getElementById('" + season + "_spoiler_span').style.display='none'; document.getElementById('" + season + "_show_id').style.display='';\x22 class=\x22link\x22>" + 
        " << </a> <span id=\x22" + season + "_spoiler_span\x22 style=\x22display: none\x22>" + fillGames(season) + " </span>"; // */
    return gameDropdown;
}

function startFunc () 
{
	var input=document.body.innerHTML, ptr1, ptr2, ptr3, id, id2, name, endptr;
	var withGameDropdown = 0; 
    var selectedTable;

	var target = document.getElementById('imonstatus');

	var runPassDef = "<span title='displays total plays, yards per play, and success rate for both runs and passes'>Rushing and passing splits</span>"; 
	var targetsDef = "<span title='displays 1st option looks, targets, average distance downfield, and dumpoffs to each possible reciever'>Reciever target splits</span>"; 
	var productionDef = "<span title='displays GCOV%, yards per target, success rate, and interception rate for each possible reciever'>Reciever production splits</span>"; 
    var defPkgSplitsDef = "<span title='displays number of snaps for each defensive package'>Defensive package splits</span>";
    var thirdFourthDownsDef = "<span title='displays 3rd and 4th down conversion attempts and success rate for a wide variety of distances'>3rd/4th downs</span>";
    var WRStatsDef = "<span title='displays 1st option checks, yards per target, success rate, and various other statistics for each individual reciever'>Individual reciever stats</span>";
    var IDPStatsDef = "<span title='displays 1st option checks, yards per target, success rate, and various other statistics for the recievers matched up against each individual defensive player'>Individual defensive player stats</span>";
    var passDistStatsDef = "<span title='displays completion percentage, interception rate, average YAC, and other statistics for passes of various distances'>Pass results by distance</span>";
    
	var withPensDef = "<span title='If this box is checked, statistics produced will include plays which were nullified by a penalty and not included in official statistics. " + 
										"If the box is not checked, these plays will be left out'> Include nullified plays "; 
    

	var buttontable = document.createElement('table');
	buttontable.setAttribute('cellspacing', '0');
	buttontable.setAttribute('cellpadding', '0');
	buttontable.setAttribute('border', '1'); 
	buttontable.setAttribute('id', 'scout_button_table');

	for (var z=0; z<teamlist.length; z++) {

		if (z % 8 ==0) {
			 var newtr2=document.createElement('tr');
			 buttontable.appendChild(newtr2);
		}

		var newtd2 = document.createElement('td');
		newtd2.setAttribute('align', 'center');
		var newtd3 = document.createElement('td');
		newtd3.setAttribute('align', 'center');

		var checkbox = document.createElement('input');
		checkbox.setAttribute('class', 'team_checkbox');
		checkbox.setAttribute("type", "checkbox");
		checkbox.setAttribute("name", "teamlistid");
		checkbox.setAttribute('align', 'center');
		checkbox.setAttribute("teamlistid", z);
		var tmpdiv=document.createElement('div');
		tmpdiv.align='center';
		tmpdiv.innerHTML = '<b>'+teamlist[z]+'</b>';
		newtd2.appendChild(checkbox);
		newtd3.appendChild(tmpdiv);
		newtr2.appendChild(newtd2); 
		newtr2.appendChild(newtd3);
	}

	var newtr3=document.createElement('tr');
	buttontable.appendChild(newtr3);
	var newtd4 = document.createElement('td'); 
	newtd4.setAttribute('colspan', '4');
	var newDiv4 = document.createElement('div'); 
	newDiv4.innerHTML = '<input type="radio" name="unit" id="offense" checked="checked">  For this team (team offense/team players) <br>' + 
    	'<input type="radio" name="unit" id="defense">  Against this team (team defense/opposing players) <br>' + 
        '<input type="radio" name="unit" id="both"> Both teams'; 
	newtd4.appendChild(newDiv4); 
	newtr3.appendChild(newtd4); 

	var newtd5 = document.createElement('td'); 
	newtd5.setAttribute('colspan', '4');
	var newDiv5 = document.createElement('div'); 
	newDiv5.innerHTML = 
		'<input type="checkbox" name="other" id="runPass">  ' + runPassDef + ' <br> ' + 
		'<input type="checkbox" name="other" id="targets">  ' + targetsDef + ' <br> ' + 
		'<input type="checkbox" name="other" id="production"> ' + productionDef + ' <br> ' + // */
        '<input type="checkbox" name="other" id="conversions"> ' + thirdFourthDownsDef + ' <br>' + 
        '<input type="checkbox" name="other" id="recievers"> ' + WRStatsDef + ' <br>' + 
        '<input type="checkbox" name="other" id="defenders"> ' + IDPStatsDef + ' <br>' + 
        '<input type="checkbox" name="other" id="passDist"> ' + passDistStatsDef + ' <br>' + 
        //'<input type="checkbox" name="other" id="sacks"> Pass Rush <br>' + 
        '<input type="checkbox" name="other" id="defPkgSplits"> ' + defPkgSplitsDef;
	newtd5.appendChild(newDiv5); 
	newtr3.appendChild(newtd5); // */ 
    
    var newtd6 = document.createElement('td'); 
    newtd6.setAttribute('colspan', '3'); 
    var newDiv6 = document.createElement('div'); 
    newDiv6.innerHTML = 
        '<input type="checkbox" name="season" id="pre"> Preseason ' + getGameDropdown("pre") + ' <br> ' + 
        '<input type="checkbox" name="season" id="reg" checked="checked"> Regular season ' + getGameDropdown("reg") + ' <br> ' + 
        '<input type="checkbox" name="season" id="post" checked="checked"> Postseason ' + getGameDropdown("post"); // */
    newtd6.appendChild(newDiv6);
    newtr3.appendChild(newtd6); // */

	var newtd7 = document.createElement('td'); 
	newtd7.setAttribute('colspan', '1'); 
	var newDiv7 = document.createElement('div'); 
	newDiv7.innerHTML = 
	'<input type="checkbox" name="pens" id="withPens">' + withPensDef; 
	newtd7.appendChild(newDiv7); 
	newtr3.appendChild(newtd7); 

	var newtr=document.createElement('tr');
	buttontable.appendChild(newtr);
	var newtd1 = document.createElement('td');
	newtd1.setAttribute('colspan', '2');
	var newDiv2 = document.createElement('div');
	newDiv2.align = 'center';
	newDiv2.innerHTML = '<input type="button" style="font-size: 10pt; font-weight: bold; width: 100%; height: 30px" value="Start">'; 
	newDiv2.addEventListener('click', function() {
        if (document.getElementById("offense").checked) {
            showOffense = 1; 
        } else {
            showOffense = 0; 
        }
        
        if (document.getElementById("both").checked) {
        	showBothTeams = 1;
        }
        else {
        	showBothTeams = 0;
        }
        
        runPassSplits = 0;
        WRTargetSplits = 0;
        WRProductionSplits = 0;
        defPkgSplits = 0;
        conversions = 0;
        individualWRStats = 0;
        individualDefenderStats = 0;
        passDistSplits = 0;
        sacks = 0;
        
        selectedTable = 0;
        
        if (document.getElementById("runPass").checked) {
            runPassSplits = 1;
            selectedTable = 1;
        }
        if (document.getElementById("targets").checked) {
            WRTargetSplits = 1;
            selectedTable = 1;
        }
        if (document.getElementById("production").checked) {
        	WRProductionSplits = 1;
            selectedTable = 1;
        } // */
        if (document.getElementById("defPkgSplits").checked) {
            defPkgSplits = 1;
            selectedTable = 1;
        }
       	if (document.getElementById("conversions").checked) {
            conversions = 1;
            selectedTable = 1;
        }
        if (document.getElementById("recievers").checked) {
        	individualWRStats = 1;
            selectedTable = 1;
        }
        if (document.getElementById("defenders").checked) {
        	individualDefenderStats = 1;
            selectedTable = 1;
        }
        /*if (document.getElementById("sacks").checked) {
        	sacks = 1;
            selectedTable = 1;
        } // */
        if (document.getElementById("passDist").checked) {
        	passDistSplits = 1;
            selectedTable = 1;
        } // */
        
        if (document.getElementById("pre").checked) {
            Preseason = 1; 
        } 
        if (document.getElementById("reg").checked) {
            RegularSeason = 1; 
        } 
        if (document.getElementById("post").checked) {
            Postseason = 1; 
        }
        
        if (document.getElementById("withPens").checked) {
            withPens = 1; 
        } else {
            withPens = 0; 
        }
        
        if (selectedTable == 0) {
        	alert("You have not selected the statistics you want displayed");
        }
        else {
        	buildGameList(input);
        	startReadLog();
      	}
	}, true);                // "Start" button, runs script 
	newtd1.appendChild(newDiv2);
	newtr.appendChild(newtd1);

	var newtd2 = document.createElement('td');
	newtd2.setAttribute('colspan', '2');
	var newDiv3 = document.createElement('div');
	newDiv3.align = 'center';
	newDiv3.innerHTML = '<input type="button" style="font-size: 10pt; font-weight: bold; width: 100%; height: 30px" value="Select all">'; 
	newDiv3.addEventListener('click', function() {
			var checkbox = getElementsByClassName('team_checkbox', document);  
			for (var i=0; i < checkbox.length; i++) checkbox[i].checked=true;   
	}, true);
	newtd2.appendChild(newDiv3);
	newtr.appendChild(newtd2);

	var newtd3 = document.createElement('td');
	newtd3.setAttribute('colspan', '2');
	var newDivA = document.createElement('div');
	newDivA.align = 'center';
	newDivA.innerHTML = '<input type="button" style="font-size: 10pt; font-weight: bold; width: 100%; height: 30px" value="Clear all">'; 
	newDivA.addEventListener('click', function() {
		var checkbox = getElementsByClassName('team_checkbox', document);  
		for (var i=0; i < checkbox.length; i++) 
			checkbox[i].checked=false;   
	}, true);
	newtd3.appendChild(newDivA);
	newtr.appendChild(newtd3);
    
    var newtd8 = document.createElement('td');
	newtd8.setAttribute('colspan', '2');
	var newDivB = document.createElement('div');
	newDivB.align = 'center';
	newDivB.innerHTML = '<input type="button" style="font-size: 10pt; font-weight: bold; width: 100%; height: 30px" value="Reset">'; 
	newDivB.addEventListener('click', function() {
        if (readcount >= readtarget) {
            readcount = 0; 
            readtarget = 1;
            links=[];
            teamList=[];
            abbrList=[];
            teamID=[];
            WRPlayerStats=[];
            IDPStats=[];
            initializeArrays();
            
            Preseason = 0; 
            RegularSeason = 0; 
            Postseason = 0;
            document.getElementById('scout_count').innerHTML="";
        }
        else {
            document.getElementById('scout_count').innerHTML='<span style="background-color:white">There is currently nothing to reset</span>';
        }
	}, true);
	newtd8.appendChild(newDivB);
	newtr.appendChild(newtd8);


	if (target) target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.insertBefore(buttontable, 
																																target.parentNode.parentNode.parentNode.parentNode.parentNode.nextSibling);
    
    addButtons("pre");
    addButtons("reg");
    addButtons("post");
}


window.setTimeout( function() {

	var input=document.body.innerHTML, ptr1, ptr2, ptr3, year, league;
    
    fillDefPkgs();
    initializeArrays();
    
	ptr1=input.indexOf("imonyear", 0);
	ptr2=input.indexOf("value=\"", ptr1);
	ptr3=input.indexOf("\"", ptr2+7);
		if (ptr1<0 || ptr2<0 || ptr3<0) { 
			alert("Can't find year"); 
			return; 
		}
	year=input.substring(ptr2+7, ptr3);

	ptr1=input.indexOf("imonlg", 0);
	ptr2=input.indexOf("value=\"", ptr1);
	ptr3=input.indexOf("\"", ptr2+7);
	if (ptr1<0 || ptr2<0 || ptr3<0) { 
		alert("Can't find league number"); 
		return; 
	}
	league=input.substring(ptr2+7, ptr3);

	GM_xmlhttpRequest({
		method: 'GET',
		url: 'http://deeproute.com/?sel=lgleaderbyteam&year=' + year + '&myleagueno=' + league + '&typer=X',
		headers: {
			 'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
			 'Accept': 'application/atom+xml,application/xml,text/xml',
		},
		onload: function(detail) {
				parseTeamStatsForAbbrs(detail.responseText);
		},
	});

}, 100);