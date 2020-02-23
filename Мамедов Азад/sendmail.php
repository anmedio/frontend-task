<?php 

$request = file_get_contents("php://input");
if(empty($request)) die();

$to = 'azad_63_mamedov@mail.ru';
$subject = 'Заказ на сайте Чистая Вода';
$headers  = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-Type: text/html; charset=utf-8';

$data = json_decode($request);
$date = strtotime($data->dateDelivery);
$formated_date = date('d - m - Y', $date);

$message = '<table>';
$message.= '<tr><td>ФИО:</td><td>' . $data->name . '</td></tr>';
// $message.= '<tr><td>E-mail:</td><td>' . $data->email; . '</td></tr>';
$message.= '<tr><td>Телефон:</td><td>' . $data->phone .'</td></tr>';
$message.= '<tr><td>Адрес:</td><td>' . $data->address .'</td></tr>';
$message.= '<tr><td>Объем бутыля:</td><td>' . $data->bottleVariant .'</td></tr>';
$message.= '<tr><td>Количество:</td><td> ' . $data->bottleCount . ' шт.</td></tr>';
$message.= '<tr><td>Дата доставки:</td><td>' . $formated_date . '</td></tr>';
$message.= '<tr><td>Время доставки:</td><td>' . $data->timeDelivery . '</td></tr>';
$message.= '<tr><td>Сумма к оплате:</td><td>' . $data->totalPrice . ' руб.</td></tr>';
$message.= '</table>';

mail($to, $subject, $message, $headers);

?>

