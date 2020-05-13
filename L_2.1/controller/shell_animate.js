$().ready(function(){
    $(".menu ul").hide();
    $(".menu .menu_btn").click(function(){
        $(".menu ul").slideToggle(300);
    })
    $(".menu ul li").hover(function(){
        var src = "image/shell/green/" + $(this).find("img").attr("data-img") + "_selected.png";
        $(this).find("img").attr("src", src);
    }, function(){
        var src = "image/shell/green/" + $(this).find("img").attr("data-img") + "_normal.png";
        $(this).find("img").attr("src", src);
    })
})