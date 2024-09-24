insert into public.account(
	account_firstname, account_lastname, account_email,account_password)
values ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

update public.account
set account_type = 'Admin'
where account_firstname = 'Tony';

delete from public.account
where account_firstname = 'Tony';

update public.inventory
set inv_description = replace(inv_description, 'small interiors', 'a huge interior')
where inv_make = 'GM' and inv_model = 'Hummer';

select inv_model, inv_model, cls.classification_name
from public.inventory inv
inner join public.classification cls on inv.classification_id = cls.classification_id
where cls.classification_name = 'Sport';

update public.inventory
set inv_image = replace(inv_image, '/images/', '/images/vehicles/'),
	inv_thumbnail = replace(inv_thumbnail, '/images/', '/images/vehicles/');
