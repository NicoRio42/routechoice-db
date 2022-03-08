var datepickr=function(d,c){var f,h,a=[],k;datepickr.prototype=datepickr.init.prototype;h=function(a){a._datepickr&&a._datepickr.destroy();a._datepickr=new datepickr.init(a,c);return a._datepickr};if(d.nodeName)return h(d);f=datepickr.prototype.querySelectorAll(d);if(1===f.length)return h(f[0]);for(k=0;k<f.length;k++)a.push(h(f[k]));return a};
datepickr.init=function(d,c){var f,h,a=this,k={dateFormat:"F j, Y",altFormat:null,altInput:null,minDate:null,maxDate:null,shorthandCurrentMonth:!1},l=document.createElement("div"),t=document.createElement("span"),u=document.createElement("table"),v=document.createElement("tbody"),g,m=new Date,B,n,p,w,C,r,x,D,E,s,F,G,y,H,z,A,I;l.className="datepickr-calendar";t.className="datepickr-current-month";c=c||{};B=function(){g=document.createElement("div");g.className="datepickr-wrapper";a.element.parentNode.insertBefore(g,
a.element);g.appendChild(a.element)};f={year:function(){return m.getFullYear()},month:{integer:function(){return m.getMonth()},string:function(a){var e=m.getMonth();return p(e,a)}},day:function(){return m.getDate()}};h={string:function(){return p(a.currentMonthView,a.config.shorthandCurrentMonth)},numDays:function(){return 1===a.currentMonthView&&(0===a.currentYearView%4&&0!==a.currentYearView%100||0===a.currentYearView%400)?29:a.l10n.daysInMonth[a.currentMonthView]}};n=function(b,e){var q="",d=new Date(e),
c={d:function(){var a=c.j();return 10>a?"0"+a:a},D:function(){return a.l10n.weekdays.shorthand[c.w()]},j:function(){return d.getDate()},l:function(){return a.l10n.weekdays.longhand[c.w()]},w:function(){return d.getDay()},F:function(){return p(c.n()-1,!1)},m:function(){var a=c.n();return 10>a?"0"+a:a},M:function(){return p(c.n()-1,!0)},n:function(){return d.getMonth()+1},U:function(){return d.getTime()/1E3},y:function(){return String(c.Y()).substring(2)},Y:function(){return d.getFullYear()}},f=b.split("");
a.forEach(f,function(a,b){c[a]&&"\\"!==f[b-1]?q+=c[a]():"\\"!==a&&(q+=a)});return q};p=function(b,e){return!0===e?a.l10n.months.shorthand[b]:a.l10n.months.longhand[b]};w=function(b,e,c,d){return b===d&&a.currentMonthView===e&&a.currentYearView===c};C=function(){var b=document.createElement("thead"),e=a.l10n.firstDayOfWeek,c=a.l10n.weekdays.shorthand;0<e&&e<c.length&&(c=[].concat(c.splice(e,c.length),c.splice(0,e)));b.innerHTML="<tr><th>"+c.join("</th><th>")+"</th></tr>";u.appendChild(b)};r=function(){var b=
(new Date(a.currentYearView,a.currentMonthView,1)).getDay(),c=h.numDays(),d=document.createDocumentFragment(),g=document.createElement("tr"),k,l="",p="",m="",n,b=b-a.l10n.firstDayOfWeek;0>b&&(b+=7);k=b;v.innerHTML="";0<b&&(g.innerHTML+='<td colspan="'+b+'">&nbsp;</td>');for(b=1;b<=c;b++){7===k&&(d.appendChild(g),g=document.createElement("tr"),k=0);l=w(f.day(),f.month.integer(),f.year(),b)?" today":"";a.selectedDate&&(p=w(a.selectedDate.day,a.selectedDate.month,a.selectedDate.year,b)?" selected":"");
if(a.config.minDate||a.config.maxDate)n=(new Date(a.currentYearView,a.currentMonthView,b)).getTime(),m="",a.config.minDate&&n<a.config.minDate&&(m=" disabled"),a.config.maxDate&&n>a.config.maxDate&&(m=" disabled");g.innerHTML+='<td class="'+l+p+m+'"><span class="datepickr-day">'+b+"</span></td>";k++}d.appendChild(g);v.appendChild(d)};x=function(){t.innerHTML=h.string()+" "+a.currentYearView};D=function(){var a=document.createElement("div");a.className="datepickr-months";a.innerHTML='<span class="datepickr-prev-month">&lt;</span><span class="datepickr-next-month">&gt;</span>';
a.appendChild(t);x();l.appendChild(a)};E=function(){0>a.currentMonthView&&(a.currentYearView--,a.currentMonthView=11);11<a.currentMonthView&&(a.currentYearView++,a.currentMonthView=0)};s=function(b){if(b.target!==a.element&&b.target!==g&&(b=b.target.parentNode,b!==g))for(;b!==g;)if(b=b.parentNode,null===b){A();break}};F=function(b){b=b.target;var c=b.className;c&&("datepickr-prev-month"===c||"datepickr-next-month"===c?("datepickr-prev-month"===c?a.currentMonthView--:a.currentMonthView++,E(),x(),r()):
"datepickr-day"!==c||a.hasClass(b.parentNode,"disabled")||(a.selectedDate={day:parseInt(b.innerHTML,10),month:a.currentMonthView,year:a.currentYearView},b=(new Date(a.currentYearView,a.currentMonthView,a.selectedDate.day)).getTime(),a.config.altInput&&(a.config.altInput.value=a.config.altFormat?n(a.config.altFormat,b):n(a.config.dateFormat,b)),a.element.value=n(a.config.dateFormat,b),A(),r()))};G=function(){D();C();r();u.appendChild(v);l.appendChild(u);g.appendChild(l)};y=function(){return"INPUT"===
a.element.nodeName?"focus":"click"};H=function(){a.addEventListener(a.element,y(),z,!1);a.addEventListener(l,"click",F,!1)};z=function(){a.addEventListener(document,"click",s,!1);a.addClass(g,"open")};A=function(){a.removeEventListener(document,"click",s,!1);a.removeClass(g,"open")};I=function(){var b,c;a.removeEventListener(document,"click",s,!1);a.removeEventListener(a.element,y(),z,!1);b=a.element.parentNode;b.removeChild(l);c=b.removeChild(a.element);b.parentNode.replaceChild(c,b)};(function(){var b,
e;a.config={};a.destroy=I;for(b in k)a.config[b]=c[b]||k[b];a.element=d;a.element.value&&(e=Date.parse(a.element.value));e&&!isNaN(e)?(e=new Date(e),a.selectedDate={day:e.getDate(),month:e.getMonth(),year:e.getFullYear()},a.currentYearView=a.selectedDate.year,a.currentMonthView=a.selectedDate.month,a.currentDayView=a.selectedDate.day):(a.selectedDate=null,a.currentYearView=f.year(),a.currentMonthView=f.month.integer(),a.currentDayView=f.day());B();G();H()})();return a};
datepickr.init.prototype={hasClass:function(d,c){return d.classList.contains(c)},addClass:function(d,c){d.classList.add(c)},removeClass:function(d,c){d.classList.remove(c)},forEach:function(d,c){[].forEach.call(d,c)},querySelectorAll:document.querySelectorAll.bind(document),isArray:Array.isArray,addEventListener:function(d,c,f,h){d.addEventListener(c,f,h)},removeEventListener:function(d,c,f,h){d.removeEventListener(c,f,h)},l10n:{weekdays:{shorthand:"Sun Mon Tue Wed Thu Fri Sat".split(" "),longhand:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ")},
months:{shorthand:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),longhand:"January February March April May June July August September October November December".split(" ")},daysInMonth:[31,28,31,30,31,30,31,31,30,31,30,31],firstDayOfWeek:0}};