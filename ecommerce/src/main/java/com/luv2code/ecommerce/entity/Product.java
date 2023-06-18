package com.luv2code.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name="product")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    /*
    @ManyToOne anotasyonu, bir ilişkiyi tanımlayarak bir ürünün yalnızca bir kategoriye ait olabileceğini belirtir. Bu anotasyon, "many-to-one" ilişkisini temsil eder, yani bir kategoriye birden çok ürün bağlanabilir.
    @JoinColumn(name="category_id", nullable = false) ifadesi, bu ilişkinin sahibi olan "Product" tablosundaki category_id sütununu kullanarak ilişkiyi yöneteceğini belirtir. name parametresi, veritabanında kullanılacak sütun adını belirtir. nullable = false ifadesi, bu sütunun boş geçilemez (nullable olmadığı) olduğunu belirtir.
    */
    @ManyToOne
    @JoinColumn(name="category_id", nullable = false)
    private ProductCategory category;

    @Column(name="sku")
    private String sku;

    @Column(name="name")
    private String name;

    @Column(name="description")
    private String description;

    @Column(name="unit_price")
    private BigDecimal unitPrice;

    @Column(name="image_url")
    private String imageUrl;

    @Column(name="active")
    private boolean active;

    @Column(name="units_in_stock")
    private int unitsInStock;

    @Column(name="date_created")
    @CreationTimestamp
    private Date dateCreated;

    @Column(name="last_updated")
    @UpdateTimestamp
    private Date lastUpdate;
}
