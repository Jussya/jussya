var myId;

var app = new Vue ({
    el: "#app",
    data: {
        photos: {
            first: false,
            second: false,
            third: false
        },
        friends: []
    }
});

$(function() {
    VK.init(function() {
        //топ - 3 фотографий
        getMyId();

        appUsers();

    }, function() {}, '5.63');

    $('[data-toggle="tooltip"]').tooltip({
        placement : 'top'
    });

    $('#invite_friends').click( function() {
        VK.callMethod("showInviteBox");
    });

    $('#upload_photo').click(function() {
        uploadPhotoToWall(myId);
    });
});

function loadPhoto(id) {
    var photos = [];
    // for (var offset = 0; offset < 1000; offset += 200) {
    VK.api("photos.getAll", {"owner_id": id, "offset":0,"extended": 1}, function (data) {
            for (var i = 0, max = data.response.items.length; i < max; i++) {
                photos.push({
                    "image": data.response.items[i].photo_130,
                    "likes": data.response.items[i].likes.count
                });
            }
            //if (max < 200) {
            photos = photos.sort(function(a, b) {
                return b.likes - a.likes;
            });
            app.photos.first = photos[0].image;
            app.photos.second = photos[1].image;
            app.photos.third = photos[2].image;
            //  break;
            //}
        }
    );
    //}
}

function getFriends(user_ids) {
    //получаем аватарки друзей
    VK.api("users.get", {"user_ids": user_ids,"fields":"photo_100"}, function (data){
            var users = [];
            for (var i = 0, max = data.response.length; i < max; i++) {
                users.push({
                    "name": data.response[i].first_name + ' ' + data.response[i].last_name,
                    "ava": data.response[i].photo_100
                });
            }
            app.friends = users;
        }
    )
}

function appUsers() {
    //друзья, у которых установлено данное приложение
    VK.api("friends.getAppUsers", function (data){
        var user_ids = data.response.join(',');
        getFriends(user_ids);
    });
}

function getMyId() {
    //получаем id друзей
    VK.api("users.get", function (data){
            var id = data.response[0].id;
            myId = id;
            loadPhoto(id);

        }
    )
}


/**
 * Постит фото и подпись на стену вк
 * 1. сформировать картинку на основе шаблона в canvas
 * 2. Получить картинку из canvas
 * 3. Получить адрес, куда отправлять картинку (сервер)
 * 4. Отправить файл по полученному адресу
 * 5. сохранить фотографию, вызовите метод photos.saveWallPhoto с параметрами server, photo, hash
 * 6. опубликовав запись с помощью метода wall.post
 * https://vk.com/dev/upload_files?f=2.%20Загрузка%20фотографий%20на%20стену
 * @param id
 */

function uploadPhotoToWall(id) {
    VK.api("photos.getWallUploadServer", {"group_id": id}, function (data){
        canvas = document.getElementById("drawingCanvas");
        context = canvas.getContext("2d");

        var img1 = new Image();
        img1.crossOrigin = 'Anonymous';
// Привязываем функцию к событию onload
// Это указывает браузеру, что делать, когда изображение загружено
        img1.onload = function() {
            context.drawImage(img1, 10,10,140,170);
        };
// Загружаем файл изображения
        img1.src = app.photos.first;

        var img2 = new Image();
        img2.crossOrigin = 'Anonymous';
// Привязываем функцию к событию onload
// Это указывает браузеру, что делать, когда изображение загружено
        img2.onload = function() {
            context.drawImage(img2,200,10,140,170);
        };
// Загружаем файл изображения
        img2.src = app.photos.second;
// save canvas image as data url (png format by default)

        var img3 = new Image();
        img3.crossOrigin = 'Anonymous';
// Привязываем функцию к событию onload
// Это указывает браузеру, что делать, когда изображение загружено
        img3.onload = function() {
            context.drawImage(img3, 10,10,140,170);
        };
// Загружаем файл изображения
        img3.src = app.photos.third;

                var dataURL = canvas.toDataURL();

                function dataURItoBlob(dataURI) {
                    // convert base64/URLEncoded data component to raw binary data held in a string
                    var byteString;
                    if (dataURI.split(',')[0].indexOf('base64') >= 0)
                        byteString = atob(dataURI.split(',')[1]);
                    else
                        byteString = unescape(dataURI.split(',')[1]);
                    // separate out the mime component
                    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                    // write the bytes of the string to a typed array
                    var ia = new Uint8Array(byteString.length);
                    for (var i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    return new Blob([ia], {type:mimeString});
                }

                var blob = dataURItoBlob(dataURL);
                var fd = new FormData();
                fd.append('photo', blob);
                console.log(fd);

                $.ajax({
                    url: data.response.upload_url,
                    data: fd,
                    dataType : "jsonp",
                    processData: false,
                    contentType: false,
                    crossDomain: true,
                    type: 'POST',
                    success: function(response){
                        console.log(response);
                    }
                });
            });
}