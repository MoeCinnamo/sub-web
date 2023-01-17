console.log(document.title); // 获取站点标题
document.title = '訂閱轉換'; // 设置站点标题
// 站点标题萌化
window.onfocus = function () {
 document.title = '歡迎回來！';
};
window.onblur = function () {
 document.title = '快回來~頁面崩潰了';
};
