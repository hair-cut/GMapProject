# GMapPhoto

サービス概要
=============
GmapPhotoは、位置情報付きの写真をGoogleマップ上に表示できるサービスです。

また、他のユーザーとアップロードした写真を共有することも可能であり、他ユーザーの写真情報を読み取り自分のマップ上に表記することもできます。

※ただし、写真に位置情報がない場合はアップロードを拒否します。

過去、大学生の時に日本の様々な場所を観光し、その思い出を写真で残しましたが、最近になってその写真がどの地域なのか忘れてしまうことになりました。

方法を工夫している中、地図上に写真を表示したら自分がとこへ行ったの残せると思いこのプロジェクトを始めました。

メイン機能
==========
### ① 位置情報がある写真をアップロードするとGoogleマップ上でその写真を撮った場所を表示してくれます。
![7](https://github.com/user-attachments/assets/55be77e9-abd1-40f6-bbd9-90c65b6b1501)
1. 写真アップロードボタンをクリックし写真を選択してアップロードをします。
2. 写真のメタデータに含まれている位置情報をもとにマップ上で写真を表記します。
3. 写真を押すと写真の拡大と写真を撮った住所を表記します。

### ② 当サービスに会員登録した他ユーザーとGoogleマップの写真登録情報を共有することができます。
![1212](https://github.com/user-attachments/assets/5314cf73-78ff-4ead-a5b9-9c05a9581a8c)

##### 「要請を送る側」
1. 右側にある写真共有ボダンを押します。
2. 青色の空欄に共有リクエストを送るメールアドレスを作成し、共有リクエストを送るボダンをクリックします。
3. 共有リクエスト送信が完了しましたというアラムが出ると要請を送ります。

![3](https://github.com/user-attachments/assets/753a2f19-47aa-438c-9982-7fa546fd0c1f)


##### 「要請を受ける側」
1. 右側にある写真共有ボダンを押します。
2. 共有リクエスト受信一覧ボダンを押します。
3. 他ユーザーから受信した要請を確認します。
4. 要請を許可したら送受信両方にアップロードした写真情報を共有します。

※ 自分と他ユーザーの写真情報の区別は写真の枠線の色で判断できます。   
※ 写真枠線の色がどのユーザーの写真情報なのかを確認するには承認済みアカウントで承認されたメールアドレスの色から確認いただけます。   


![4](https://github.com/user-attachments/assets/f397a5e7-dd2e-45e4-9be2-46cb0ef0c69a)


##### 「共有を中止」
1. 右側にある写真共有ボダンを押します。
2. 承認済みアカウントボダンを押します。
3. 承認されたメールアドレスの中、解除するメールアドレスの横に共有中止を押します。

使用技術
=============
|フロントエンド|バックエンド|そのほか|
|------|---|---|
|Vue.js|Node.js|Firebase storage|
|TailwindCSS||Firebase database|



