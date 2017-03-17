from django.db import models


class Device(models.Model):

    device_id = models.AutoField(primary_key=True,)

    topology = models.ForeignKey('Topology',)

    name = models.CharField(max_length=200, )

    x = models.IntegerField()

    y = models.IntegerField()

    id = models.IntegerField()


class Link(models.Model):

    link_id = models.AutoField(primary_key=True,)

    from_device = models.ForeignKey('Device',  related_name='+', )

    to_device = models.ForeignKey('Device',  related_name='+', )


class Topology(models.Model):

    topology_id = models.AutoField(primary_key=True,)

    name = models.CharField(max_length=200, )

    id = models.IntegerField()

    scale = models.FloatField()

    panX = models.FloatField()

    panY = models.FloatField()
