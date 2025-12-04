# 方法笔记

## 图片压缩

```php
public function compressedImageTwo() {
        //  接收图片
        $imgSrc =  $this->request->file('file');
        //  图片保存的位置
        $imgDst = \think\facade\Filesystem::putFile( 'uploads/images', $imgSrc);
        list($width, $height, $type) = getimagesize($imgSrc);

        $new_width = $width;//压缩后的图片宽
        $new_height = $height;//压缩后的图片高

        if($width >= 600){
            $per = 600 / $width;//计算比例
            $new_width = $width * $per;
            $new_height = $height * $per;
        }

        switch ($type) {
            case 1:
                $giftype = check_gifcartoon($imgSrc);
                if ($giftype) {
                    header('Content-Type:image/gif');
                    $image_wp = imagecreatetruecolor($new_width, $new_height);
                    $image = imagecreatefromgif($imgSrc);
                    imagecopyresampled(
                        $image_wp, $image, 0, 0, 0, 0, $new_width, $new_height, $width, $height
                    );
                    //90代表的是质量、压缩图片容量大小
                    imagejpeg($image_wp, $imgDst, 100);
                    imagedestroy($image_wp);
                    imagedestroy($image);
                }
                break;
            case 2:
                header('Content-Type:image/jpeg');
                $image_wp = imagecreatetruecolor(intval($new_width), intval($new_height));
                $image = imagecreatefromjpeg($imgSrc);
                imagecopyresampled(
                    $image_wp, $image, 0, 0, 0, 0, intval($new_width), 
                    intval($new_height), intval($width), intval($height)
                );
                //90代表的是质量、压缩图片容量大小
                imagejpeg($image_wp, $imgDst, 70);
                imagedestroy($image_wp);
                imagedestroy($image);
                break;
            case 3:
                header('Content-Type:image/png');
                $image_wp = imagecreatetruecolor($new_width, $new_height);
                $image = imagecreatefrompng($imgSrc);
                imagecopyresampled(
                    $image_wp, $image, 0, 0, 0, 0, $new_width, $new_height, $width, $height
                );
                //90代表的是质量、压缩图片容量大小
                imagejpeg($image_wp, $imgDst, 90);
                imagedestroy($image_wp);
                imagedestroy($image);
                break;
        }
    }
```

## 文件压缩

```php
public function makeZip(){
        $zip = new \ZipArchive();
        $filename = 'uploads.zip';
        if ($zip->open($filename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
            // 遍历`uploads`文件夹中的所有文件并添加到压缩包中
            $folder = 'uploads/';
            $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($folder));
            foreach ($files as $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = str_replace($folder, '', $filePath);
                    $zip->addFile($filePath, $relativePath);
                }
            }
            $zip->close();
            // 下载压缩包
            header("Content-Type: application/zip");
            header("Content-Disposition: attachment; filename=\"$filename\"");
            header("Content-Length: " . filesize($filename));
            readfile($filename);
            // 删除临时文件
            unlink($filename);
        }
    }
```

## 发送邮箱验证码

```php
 //  引入相关类
    use PHPMailer\PHPMailer\Exception;
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\SMTP;
    //  实现方法
    public static function sendEmailCode(): bool|int
    {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->isSMTP();
            $mail->SMTPDebug  = SMTP::DEBUG_SERVER;
            $mail->Host       = 'smtp.qq.com';
            $mail->Port       = 465;
            $mail->Username   = '发件人邮箱';
            $mail->SMTPAuth   = true;
            $mail->Password   = 'epqycxedghhpbcac';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->addAddress('xxxxxx@qq.com', '名称');
            $mail->isHTML(true);
            $mail->Subject = '主体：邮箱验证码';
            $mail->Body    = '内容：以下是您的验证码：';
            $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';
            // 生成六位随机数作为验证码
            $code = mt_rand(100000, 999999);
            // 存储验证码到session或缓存中，用于验证
            session('email_code', $code);
            $mail->Body .= $code;
            $mail->send();
            return $code;
        } catch (Exception $e) {
            return false;
        }
    }
```

## 生成随机数

```php
    /**
     * 生成标识
     * @param $length - 长度
     * @return string
     */
    public static function groupKey($length)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyz';
        $charactersLength = strlen($characters);
        $randomString = '';

        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }
```


## sql查询字符串中的某一个字符

```php
   
    $keyword = ",40,";
    $lists = BorrowCompanyConfig::where(self::query($params))
    ->whereRaw("project_id REGEXP '{$keyword}'")
    ->with(['withCompany','withProject'])
        ->field('id,company_id,project_id,group_name,type,create_time')
        ->paginate(empty($params['page_size']) ? 10 : $params['page_size'])
        ->toArray();
    
    $projectIdsData = ****::where('company_id',$params['company_id'])
        ->whereRaw("FIND_IN_SET('{$params['admin_id']}', project_head_id)")
        ->column('id');
```
