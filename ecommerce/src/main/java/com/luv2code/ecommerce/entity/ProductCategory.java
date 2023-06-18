package com.luv2code.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name="product_category")
@Getter
@Setter
public class ProductCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private  Long id;

    @Column(name="category_name")
    private String categoryName;

    /*
    @OneToMany anotasyonu, bir ilişki tanımlayarak bir kategorinin birden çok ürün içerebileceğini belirtir. Bu anotasyon, bir "one-to-many" ilişkisini temsil eder, yani bir kategoriye ait birden çok ürün olabilir.
    Set, Java'da bir koleksiyon türüdür ve bir elemanın yalnızca bir kez bulunabileceği, tekrarlanmayan bir koleksiyonu temsil eder. Product ise, oluşturulmuş bir sınıfın adıdır ve products kümesinde tutulacak olan nesnelerin tipini belirtir.
    cascade = CascadeType.ALL ifadesi, bu ilişkinin sahibi olan "category" tablosundaki kayıtların silindiğinde ilişkili "product" tablosundaki kayıtların da silinmesini sağlar. Yani, kategori silindiğinde ilişkili ürünler de otomatik olarak silinir.
     */
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "category")
    private Set<Product> products;
}
