listIndex=1;
var app = S.start();

//home list
var home = app.getPage("home");
var home_vm = new Vue({ el: home, data:{} })

home.addEventListener("ready", function(){
  home_vm.$data.loading=true;
  fetchList( getAnydate(listIndex) );
});

function getAnydate(AddDayCount) {
  var d, dd, m, y;
  dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount);
  y = dd.getFullYear();
  m = ('0' + (dd.getMonth()+1)).slice(-2)
  d = ('0' + dd.getDate()).slice(-2)
  return y  + m  + d;
};
 

function fetchList(date){

  home_vm.$data.loading=true;
  S.ajax({
    url:"http://jsonp.nodejitsu.com/?url=http://news-at.zhihu.com/api/3/stories/before/"+date,
    method: "get",
    success:function(result){
      listIndex--;
      home_vm.$data.loading=false;
      if(!home_vm.$data.list.stories){
        home_vm.$data.list=result;
      }else{
        home_vm.$data.list.stories= home_vm.$data.list.stories.concat(result.stories);
      }
    },
    error:function(){
      alert("加载列表出错，请刷新页面重试！");
    }
  }) 
}


//detail page
var detail = app.getPage("detail");
var detail_vm = new Vue({ el: detail, data:{} })

detail.addEventListener("show", function(){
  if(detail_vm.$data.nid != this.newsid){
      
      detail_vm.$data.content = {};
      detail_vm.$data.loading = true;     
      S.ajax({
        url:"http://jsonp.nodejitsu.com/?url=http://news-at.zhihu.com/api/3/story/"+this.newsid,
        success:function(result){
          detail_vm.$data.nid = this.newsid;
          detail_vm.$data.loading=false;
          detail_vm.$data.content=result;
        }
      });
    }
});

//router handle
var router = S.Router({
  routes:{
    '': "default",
    'paper/:id':"detail",
  },
  default:function(){
    app.show("home");    
  },
  "detail":function(newsid){
    if(listIndex>=1){
      window.location.hash="#";
      return;
    }
    detail.newsid = newsid;
    app.show('detail');
  }
})


//endless scroll load
var list = home.querySelector(".sm-content");
list.addEventListener("scroll", function(){
  if(listIndex<-50 ) return;
  var that=this;
  clearTimeout(window.scrollTimer);
  window.scrollTimer=setTimeout(function(){
    if(that.scrollTop > (that.scrollHeight - that.clientHeight-10) ){
      fetchList( getAnydate(listIndex) );
    }
  }, 500);
  
})