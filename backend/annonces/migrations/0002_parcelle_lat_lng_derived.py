from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('annonces', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parcelle',
            name='latitude',
            field=models.FloatField(editable=False),
        ),
        migrations.AlterField(
            model_name='parcelle',
            name='longitude',
            field=models.FloatField(editable=False),
        ),
    ]
