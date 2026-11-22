insert into public.rooms (daycare_id, name)
values
  ((select id from public.daycares where name = 'Guardería Sala Soles'), 'Soles'),
  ((select id from public.daycares where name = 'Guardería Sala Soles'), 'Lunas'),
  ((select id from public.daycares where name = 'Guardería Sala Soles'), 'Estrellas');
