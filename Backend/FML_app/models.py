from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.
class Catagory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    discription = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        self.slug = self.name.replace(" ", "-").lower()
        super(Catagory, self).save(*args, **kwargs)
        
class Post(models.Model):
    
    class PostObjects(models.Manager):
        def get_queryset(self):
            return super().get_queryset().filter(status="publish")
    
    options = (
        ("draft", "Draft"),
        ("publish", "Publish")
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    main_content = models.TextField()
    excerpt = models.TextField(blank=True, null=True)
    content1 = models.TextField(blank=True, null=True)
    content2 = models.TextField(blank=True, null=True)
    content3 = models.TextField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    catagory = models.ManyToManyField(Catagory)
    published_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=10, choices=options, default="publish")
    objects = models.Manager()  # Default manager
    posted_objects = PostObjects()  # Custom manager for published posts

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        self.slug = self.title.replace(" ", "-").lower()
        super(Post, self).save(*args, **kwargs)
        
class Post_Image(models.Model):
    position_options = (
        (1, "Image 1"),
        (2, "Image 2"),
        (3, "Image 3"),
        (4, "Image 4"),
        (5, "Image 5"),
        (6, "Image 6"),
        (7, "Image 7"),
        (8, "Image 8")
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    position = models.IntegerField(choices=position_options)
    image = models.ImageField(upload_to='./images/post_images/')
    discription = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Image for {self.post.title}"