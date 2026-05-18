from django import forms


class RegistrationForm(forms.Form):
    firstName = forms.CharField(
        label='Имя',
        min_length=2,
        max_length=50,
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Только буквы, первая заглавная'})
    )
    lastName = forms.CharField(
        label='Фамилия',
        min_length=2,
        max_length=50,
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Только буквы, первая заглавная'})
    )
    patronymic = forms.CharField(
        label='Отчество',
        max_length=50,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Необязательное поле'})
    )
    email = forms.EmailField(
        label='Email',
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'example@mail.com'})
    )
    age = forms.IntegerField(
        label='Возраст',
        min_value=18,
        max_value=100,
        required=True,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'От 18 до 100'})
    )

    password = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        required=True,
        min_length=8
    )
    password2 = forms.CharField(
        label='Повторите пароль',
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        required=True
    )

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password2 = cleaned_data.get("password2")

        if password and password2 and password != password2:
            raise forms.ValidationError("Пароли не совпадают.")

        return cleaned_data

    def clean_firstName(self):
        name = self.cleaned_data['firstName']
        if not name[0].isupper():
            raise forms.ValidationError("Имя должно начинаться с заглавной буквы.")
        return name

    def clean_lastName(self):
        name = self.cleaned_data['lastName']
        if not name[0].isupper():
            raise forms.ValidationError("Фамилия должна начинаться с заглавной буквы.")
        return name


class FeedbackForm(forms.Form):
    name = forms.CharField(label="Ваше имя", max_length=100, widget=forms.TextInput(attrs={'class': 'form-control'}))
    email = forms.EmailField(label="Ваш Email", widget=forms.EmailInput(attrs={'class': 'form-control'}))
    message = forms.CharField(label="Сообщение", widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3}))
