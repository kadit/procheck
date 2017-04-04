$(function(){
    var os = require('os');
    var shell = require('shell');
    var fs = require("fs");
    var remote = require('electron').remote;
     var _ = require('underscore');
    
    var json = JSON.parse(fs.readFileSync('./config.json'));

    var intervalId = null;
    var inspMsgs = json.INSP_MESSAGES;
    var tasks = json.TASKS;
    var freq = json.FREQUENCY_INSP_MSGS_IN_MINS;

    var sanitizeHtml= function(htmlString){
        return htmlString.split("&lt;").join("<").split("&gt;").join(">");
    }

    $("#minMainWindow").click(function(event){
    	event.preventDefault();
    	remote.getCurrentWindow().hide();
    });
    $("#closeMainWindow").click(function(event){
    	event.preventDefault();
    	remote.getCurrentWindow().close();
    });

    $("#analyzeBtn").click(function(event){
        
    }); 

    var resetTaskIds = function(){
        for(var i=0;i<tasks.length;i++){
            tasks[i].id=i;
        }
    };
    var taskIndexBeingLogged = -1;
    var startLogging = (function(){
        setInterval(function(){
            if(taskIndexBeingLogged!==-1){
                tasks[taskIndexBeingLogged].time_logged+=5;
            }
            
        },1000);
    })();
    var reAttachEventHandlersForAnalyzePage = function(){
        $("#analysisBackBtn").click(function(event){
            $("#chartPage").fadeOut("slow",function(){
                $("#mainPage").fadeIn();
            });
        });
    };
    var setActiveTask = function(index){
        for(var i=0;i<tasks.length;i++){
            if(tasks[i].id===index){
                tasks[i].is_active='active';
            }else{
                 tasks[i].is_active='';
            }
        }
    };
   
    var reAttachEventHandlersForTasksPage = function(){
        $("#manageTasksBackBtn").click(function(event){
            $("#tasksPage").fadeOut("slow",function(){
                $("#mainPage").fadeIn();
            });
        });
        $(".logBtn").click(function(event){
            var x = event.target;
            var taskIndex= $('.logBtn').index($(x));
            taskIndexBeingLogged = taskIndex;
            setActiveTask(taskIndex);
            $("div.active").removeClass("active");
            $(event.currentTarget).parent().parent().parent().parent().addClass("active");
        });
        $(".delBtn").click(function(event){
            console.log("Delete task");
            var x = event.target;
            var taskIndex= $('.delBtn').index($(x));
            tasks.splice(taskIndex,1);
            resetTaskIds();
            var template= _.template(sanitizeHtml($('#tasksTpl').html()));
             $("#tasksPage").html(template({"tasks":tasks}));
             reAttachEventHandlersForTasksPage();
            
        });
        $("#add").click(function(event){
              var template= _.template(sanitizeHtml($('#newTaskTpl').html()));
              $("#newTask").html(template());
              $("#newTaskInput").keydown(function(event){
                if(event.which===13){
                    var val = $("#newTaskInput").val();
                    if(!val) return;
                    tasks.push({
                        "name":val,
                        "time_logged":0,
                        "is_active":''
                    });
                    resetTaskIds();
                     $("#newTask").html("");
                     var template= _.template(sanitizeHtml($('#tasksTpl').html()));
                     $("#tasksPage").html(template({"tasks":tasks}));
                     reAttachEventHandlersForTasksPage();
                }else if(event.which===27){
                    $("#newTask").html("");
                }
              });
           
        });
    };

    var populateChart = function(){
    var width,height
    var chartWidth, chartHeight
    var margin
    var svg = d3.select("#chart").append("svg")
    var chartLayer = svg.append("g").classed("chartLayer", true)
    
   
    var data = tasks;
        setSize(data);
        drawChart(data);
    function setSize(data) {
        width = 500;
        height =400;
    
        margin = {top:40, left:0, bottom:40, right:0 };
        
        
        chartWidth = width - (margin.left+margin.right);
        chartHeight = height - (margin.top+margin.bottom);
        
        svg.attr("width", width).attr("height", height);
        
        
        chartLayer
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate("+[margin.left, margin.top]+")");
            
            
    }
    
    function drawChart(data) {
    
        var arcs = d3.pie()
            .sort(null)
            .value(function(d) { return d.time_logged; })
            (data);
        
        
        var arc = d3.arc()
            .outerRadius(chartHeight/2)
            .innerRadius(chartHeight/3)
            .padAngle(0.03)
            .cornerRadius(8);
            
        var pieG = chartLayer.selectAll("g")
            .data([data])
            .enter()
            .append("g")
            .attr("transform", "translate("+[chartWidth/2, chartHeight/2]+")");
        
        var block = pieG.selectAll(".arc")
            .data(arcs);
            
        var newBlock = block.enter().append("g").classed("arc", true);
            
        
        newBlock.append("path")
            .attr("d", arc)
            .attr("id", function(d, i) { return "arc-" + i })
            .attr("stroke", "gray")
            .attr("fill", function(d,i){ return d3.interpolateCool(Math.random()) });
        
        
        newBlock.append("text")
            .attr("dx", 55)
            .attr("dy", -5)
            .append("textPath")
            .attr("xlink:href", function(d, i) { return "#arc-" + i; })
            .style("fill","#A7A7AF")
            .text(function(d) {return d.data.name });
    }
    };

    $(".manageTasksRow").click(function(event){
        $("#mainPage").fadeOut("fast",function(){
             $("#tasksPage").fadeIn();
             var template= _.template(sanitizeHtml($('#tasksTpl').html()));
             $("#tasksPage").html(template({"tasks":tasks}));
             reAttachEventHandlersForTasksPage();
        });
        
    });
    $('.analysisRow').click(function(event){ 
        $("#mainPage").fadeOut("fast",function(){
            $("#chartPage").fadeIn();
             var template= _.template(sanitizeHtml($('#chartTpl').html()));
            $("#chartPage").html(template());
            reAttachEventHandlersForAnalyzePage();
            populateChart();
        });
        
       
    });
    $("#myproCheckChkbox").change(function(event){
    	var isInspChkboxChecked = event.currentTarget.checked;
    	var getAMsg = function(){
            var notIndex = window.localStorage.getItem("notificationIndex");
            if((notIndex===null || notIndex===undefined) || (notIndex && notIndex>=inspMsgs.length)){
                window.localStorage.setItem("notificationIndex",0);
            }
            window.localStorage.setItem("inspArr",JSON.stringify(inspMsgs));


			var BrowserWindow = remote.BrowserWindow;
			var notifierWindow = new BrowserWindow({
			 x:700, 
			 y:500,
			 width: 800, 
			 height: 200,
			 frame:false,
             icon:'./img/q.png'
			});
		   notifierWindow.setMenu(null);
		   notifierWindow.loadURL('file://' + __dirname + '/notifierContent.html');
		   notifierWindow.on('closed', function() {
		     notifierWindow = null;
		   });
		   setTimeout(function(){
		   	  notifierWindow.close();
		   },7000);
    		
    		
    	};
    	if(isInspChkboxChecked){
                getAMsg();
    			intervalId = setInterval(getAMsg, freq*60*1000);
    	}else{
    		clearInterval(intervalId);
    	}
    });


});